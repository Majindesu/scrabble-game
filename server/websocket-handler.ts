import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import type { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';

// Types for multiplayer game state
export interface Player {
  id: string;
  name: string;
  score: number;
  tiles: Array<{ letter: string; points: number }>;
  isConnected: boolean;
  lastSeen: Date;
}

export interface MultiplayerGame {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  board: any[][]; // BoardCell[][]
  tilesBag: Array<{ letter: string; points: number }>;
  gameStatus: 'waiting' | 'active' | 'finished';
  maxPlayers: number;
  createdAt: Date;
  lastActivity: Date;
}

// In-memory game storage (in production, use Redis or database)
const games = new Map<string, MultiplayerGame>();
const playerToGame = new Map<string, string>(); // playerId -> gameId

// WebSocket event types
export interface ServerToClientEvents {
  'game:joined': (data: { game: MultiplayerGame; playerId: string }) => void;
  'game:updated': (game: MultiplayerGame) => void;
  'game:player-joined': (player: Player) => void;
  'game:player-left': (playerId: string) => void;
  'game:turn-changed': (data: { currentPlayerIndex: number; currentPlayer: Player }) => void;
  'game:move-made': (data: { 
    playerId: string; 
    move: any; // TileMove[]
    newBoard: any[][];
    newScores: { [playerId: string]: number };
  }) => void;
  'game:error': (error: string) => void;
  'room:list': (rooms: Array<{ id: string; playerCount: number; maxPlayers: number; gameStatus: string }>) => void;
}

export interface ClientToServerEvents {
  'game:create': (data: { playerName: string; maxPlayers?: number }) => void;
  'game:join': (data: { gameId: string; playerName: string }) => void;
  'game:leave': () => void;
  'game:make-move': (data: { move: any; newBoard: any[][] }) => void;
  'game:pass-turn': () => void;
  'game:exchange-tiles': (data: { tilesToExchange: string[] }) => void;
  'room:list-request': () => void;
}

export function setupWebSocket(server: Server) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Create a new game
    socket.on('game:create', ({ playerName, maxPlayers = 2 }) => {
      try {
        const gameId = uuidv4();
        const playerId = socket.id;
        
        const newPlayer: Player = {
          id: playerId,
          name: playerName,
          score: 0,
          tiles: [], // Will be populated with starting tiles
          isConnected: true,
          lastSeen: new Date()
        };

        const newGame: MultiplayerGame = {
          id: gameId,
          players: [newPlayer],
          currentPlayerIndex: 0,
          board: initializeEmptyBoard(),
          tilesBag: initializeTileBag(),
          gameStatus: 'waiting',
          maxPlayers,
          createdAt: new Date(),
          lastActivity: new Date()
        };

        // Deal starting tiles to the player
        dealStartingTiles(newGame, newPlayer);

        games.set(gameId, newGame);
        playerToGame.set(playerId, gameId);
        
        socket.join(gameId);
        socket.emit('game:joined', { game: newGame, playerId });
        
        console.log(`Game created: ${gameId} by ${playerName}`);
      } catch (error) {
        socket.emit('game:error', 'Failed to create game');
        console.error('Error creating game:', error);
      }
    });

    // Join an existing game
    socket.on('game:join', ({ gameId, playerName }) => {
      try {
        const game = games.get(gameId);
        const playerId = socket.id;

        if (!game) {
          socket.emit('game:error', 'Game not found');
          return;
        }

        if (game.players.length >= game.maxPlayers) {
          socket.emit('game:error', 'Game is full');
          return;
        }

        if (game.gameStatus !== 'waiting') {
          socket.emit('game:error', 'Game already in progress');
          return;
        }

        const newPlayer: Player = {
          id: playerId,
          name: playerName,
          score: 0,
          tiles: [],
          isConnected: true,
          lastSeen: new Date()
        };

        // Deal starting tiles
        dealStartingTiles(game, newPlayer);
        
        game.players.push(newPlayer);
        game.lastActivity = new Date();

        // Start game if we have enough players
        if (game.players.length >= 2) {
          game.gameStatus = 'active';
        }

        playerToGame.set(playerId, gameId);
        socket.join(gameId);

        // Notify all players in the game
        io.to(gameId).emit('game:player-joined', newPlayer);
        io.to(gameId).emit('game:updated', game);
        
        socket.emit('game:joined', { game, playerId });
        
        console.log(`Player ${playerName} joined game: ${gameId}`);
      } catch (error) {
        socket.emit('game:error', 'Failed to join game');
        console.error('Error joining game:', error);
      }
    });

    // Make a move
    socket.on('game:make-move', ({ move, newBoard }) => {
      try {
        const gameId = playerToGame.get(socket.id);
        const game = games.get(gameId || '');
        const playerId = socket.id;

        if (!game || !gameId) {
          socket.emit('game:error', 'Game not found');
          return;
        }

        const playerIndex = game.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) {
          socket.emit('game:error', 'Player not in game');
          return;
        }

        if (game.currentPlayerIndex !== playerIndex) {
          socket.emit('game:error', 'Not your turn');
          return;
        }

        if (game.gameStatus !== 'active') {
          socket.emit('game:error', 'Game not active');
          return;
        }

        // Update game state
        game.board = newBoard;
        game.lastActivity = new Date();
        
        // Calculate scores (simplified for now)
        const moveScore = calculateMoveScore(move, newBoard);
        game.players[playerIndex].score += moveScore;

        // Remove used tiles from player's rack and draw new ones
        updatePlayerTiles(game, game.players[playerIndex], move);

        // Move to next player
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;

        // Notify all players
        const newScores: { [playerId: string]: number } = {};
        game.players.forEach(p => newScores[p.id] = p.score);

        io.to(gameId).emit('game:move-made', {
          playerId,
          move,
          newBoard,
          newScores
        });

        io.to(gameId).emit('game:turn-changed', {
          currentPlayerIndex: game.currentPlayerIndex,
          currentPlayer: game.players[game.currentPlayerIndex]
        });

        io.to(gameId).emit('game:updated', game);

      } catch (error) {
        socket.emit('game:error', 'Failed to make move');
        console.error('Error making move:', error);
      }
    });

    // Pass turn
    socket.on('game:pass-turn', () => {
      try {
        const gameId = playerToGame.get(socket.id);
        const game = games.get(gameId || '');

        if (!game || !gameId) {
          socket.emit('game:error', 'Game not found');
          return;
        }

        const playerIndex = game.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== game.currentPlayerIndex) {
          socket.emit('game:error', 'Not your turn');
          return;
        }

        // Move to next player
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
        game.lastActivity = new Date();

        io.to(gameId).emit('game:turn-changed', {
          currentPlayerIndex: game.currentPlayerIndex,
          currentPlayer: game.players[game.currentPlayerIndex]
        });

      } catch (error) {
        socket.emit('game:error', 'Failed to pass turn');
      }
    });

    // List available games
    socket.on('room:list-request', () => {
      const availableRooms = Array.from(games.values())
        .filter(game => game.gameStatus === 'waiting' && game.players.length < game.maxPlayers)
        .map(game => ({
          id: game.id,
          playerCount: game.players.length,
          maxPlayers: game.maxPlayers,
          gameStatus: game.gameStatus
        }));

      socket.emit('room:list', availableRooms);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      
      const gameId = playerToGame.get(socket.id);
      if (gameId) {
        const game = games.get(gameId);
        if (game) {
          const player = game.players.find(p => p.id === socket.id);
          if (player) {
            player.isConnected = false;
            player.lastSeen = new Date();
            
            // Notify other players
            socket.to(gameId).emit('game:player-left', socket.id);
            socket.to(gameId).emit('game:updated', game);
            
            // Clean up empty games after a delay
            setTimeout(() => cleanupGame(gameId), 30000); // 30 seconds
          }
        }
        
        playerToGame.delete(socket.id);
      }
    });
  });

  // Cleanup disconnected games periodically
  setInterval(cleanupDisconnectedGames, 60000); // Every minute

  return io;
}

// Helper functions
function initializeEmptyBoard() {
  return Array(15).fill(null).map(() => 
    Array(15).fill(null).map(() => ({}))
  );
}

function initializeTileBag() {
  // Standard Scrabble tile distribution
  const tileDistribution = [
    { letter: 'A', points: 1, count: 9 },
    { letter: 'B', points: 3, count: 2 },
    { letter: 'C', points: 3, count: 2 },
    { letter: 'D', points: 2, count: 4 },
    { letter: 'E', points: 1, count: 12 },
    // ... (we'll implement full distribution later)
  ];

  const bag: Array<{ letter: string; points: number }> = [];
  tileDistribution.forEach(({ letter, points, count }) => {
    for (let i = 0; i < count; i++) {
      bag.push({ letter, points });
    }
  });

  // Shuffle the bag
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }

  return bag;
}

function dealStartingTiles(game: MultiplayerGame, player: Player) {
  const tilesToDeal = 7;
  for (let i = 0; i < tilesToDeal && game.tilesBag.length > 0; i++) {
    const tile = game.tilesBag.pop()!;
    player.tiles.push(tile);
  }
}

function calculateMoveScore(move: any, board: any[][]): number {
  // Simplified scoring - in production, implement full Scrabble scoring
  return move.length * 5; // Placeholder
}

function updatePlayerTiles(game: MultiplayerGame, player: Player, move: any) {
  // Remove used tiles and draw new ones (simplified)
  const tilesToDraw = Math.min(move.length, game.tilesBag.length);
  for (let i = 0; i < tilesToDraw; i++) {
    const newTile = game.tilesBag.pop();
    if (newTile) {
      player.tiles.push(newTile);
    }
  }
}

function cleanupGame(gameId: string) {
  const game = games.get(gameId);
  if (game && game.players.every(p => !p.isConnected)) {
    console.log(`Cleaning up empty game: ${gameId}`);
    games.delete(gameId);
    game.players.forEach(p => playerToGame.delete(p.id));
  }
}

function cleanupDisconnectedGames() {
  const now = new Date();
  const timeout = 10 * 60 * 1000; // 10 minutes
  
  games.forEach((game, gameId) => {
    if (now.getTime() - game.lastActivity.getTime() > timeout) {
      console.log(`Cleaning up inactive game: ${gameId}`);
      games.delete(gameId);
      game.players.forEach(p => playerToGame.delete(p.id));
    }
  });
}

// Export the main setup function
export { setupWebSocket as setupWebSocketHandler };

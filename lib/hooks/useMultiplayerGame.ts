import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  MultiplayerGame, 
  Player 
} from '../../server/websocket-handler';

interface UseMultiplayerGameResult {
  // Connection state
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  
  // Game state
  game: MultiplayerGame | null;
  currentPlayer: Player | null;
  isMyTurn: boolean;
  
  // Available rooms
  availableRooms: Array<{ id: string; playerCount: number; maxPlayers: number; gameStatus: string }>;
  
  // Actions
  createGame: (playerName: string, maxPlayers?: number) => void;
  joinGame: (gameId: string, playerName: string) => void;
  spectateGame: (gameId: string, spectatorName: string) => void;
  leaveGame: () => void;
  makeMove: (move: any, newBoard: any[][]) => void;
  passTurn: () => void;
  exchangeTiles: (tilesToExchange: string[]) => void;
  requestRoomList: () => void;
  
  // Status
  error: string | null;
  loading: boolean;
}

export function useMultiplayerGame(): UseMultiplayerGameResult {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [game, setGame] = useState<MultiplayerGame | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Array<{ id: string; playerCount: number; maxPlayers: number; gameStatus: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const currentPlayerIdRef = useRef<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io('http://localhost:3000', {
      transports: ['websocket']
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to multiplayer server');
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from multiplayer server');
      setIsConnected(false);
    });

    socketInstance.on('game:joined', ({ game: joinedGame, playerId }) => {
      console.log('Joined game:', joinedGame.id);
      setGame(joinedGame);
      currentPlayerIdRef.current = playerId;
      setLoading(false);
      setError(null);
    });

    socketInstance.on('game:updated', (updatedGame) => {
      console.log('Game updated:', updatedGame.id);
      setGame(updatedGame);
    });

    socketInstance.on('game:player-joined', (player) => {
      console.log('Player joined:', player.name);
      setError(null);
    });

    socketInstance.on('game:player-left', (playerId) => {
      console.log('Player left:', playerId);
    });

    socketInstance.on('game:turn-changed', ({ currentPlayerIndex, currentPlayer: newCurrentPlayer }) => {
      console.log('Turn changed to:', newCurrentPlayer.name);
      setCurrentPlayer(newCurrentPlayer);
    });

    socketInstance.on('game:move-made', ({ playerId, move, newBoard, newScores }) => {
      console.log('Move made by:', playerId);
      // The game state will be updated via 'game:updated' event
    });

    socketInstance.on('game:error', (errorMessage) => {
      console.error('Game error:', errorMessage);
      setError(errorMessage);
      setLoading(false);
    });

    socketInstance.on('room:list', (rooms) => {
      console.log('Available rooms:', rooms);
      setAvailableRooms(rooms);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Computed values
  const isMyTurn = game && currentPlayer ? 
    game.players[game.currentPlayerIndex]?.id === currentPlayerIdRef.current : false;

  // Action handlers
  const createGame = useCallback((playerName: string, maxPlayers = 2) => {
    if (!socket || !isConnected) {
      setError('Not connected to server');
      return;
    }
    
    setLoading(true);
    setError(null);
    socket.emit('game:create', { playerName, maxPlayers });
  }, [socket, isConnected]);

  const joinGame = useCallback((gameId: string, playerName: string) => {
    if (!socket || !isConnected) {
      setError('Not connected to server');
      return;
    }
    
    setLoading(true);
    setError(null);
    socket.emit('game:join', { gameId, playerName });
  }, [socket, isConnected]);

  const spectateGame = useCallback((gameId: string, spectatorName: string) => {
    if (!socket || !isConnected) {
      setError('Not connected to server');
      return;
    }
    
    setLoading(true);
    setError(null);
    socket.emit('game:spectate', { gameId, spectatorName });
  }, [socket, isConnected]);

  const leaveGame = useCallback(() => {
    if (!socket) return;
    
    socket.emit('game:leave');
    setGame(null);
    setCurrentPlayer(null);
    currentPlayerIdRef.current = null;
  }, [socket]);

  const makeMove = useCallback((move: any, newBoard: any[][]) => {
    if (!socket || !game) {
      setError('Cannot make move: not in game');
      return;
    }
    
    if (!isMyTurn) {
      setError('Cannot make move: not your turn');
      return;
    }
    
    socket.emit('game:make-move', { move, newBoard });
  }, [socket, game, isMyTurn]);

  const passTurn = useCallback(() => {
    if (!socket || !game) {
      setError('Cannot pass turn: not in game');
      return;
    }
    
    if (!isMyTurn) {
      setError('Cannot pass turn: not your turn');
      return;
    }
    
    socket.emit('game:pass-turn');
  }, [socket, game, isMyTurn]);

  const exchangeTiles = useCallback((tilesToExchange: string[]) => {
    if (!socket || !game) {
      setError('Cannot exchange tiles: not in game');
      return;
    }
    
    if (!isMyTurn) {
      setError('Cannot exchange tiles: not your turn');
      return;
    }
    
    socket.emit('game:exchange-tiles', { tilesToExchange });
  }, [socket, game, isMyTurn]);

  const requestRoomList = useCallback(() => {
    if (!socket || !isConnected) return;
    
    socket.emit('room:list-request');
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    game,
    currentPlayer,
    isMyTurn,
    availableRooms,
    createGame,
    joinGame,
    spectateGame,
    leaveGame,
    makeMove,
    passTurn,
    exchangeTiles,
    requestRoomList,
    error,
    loading
  };
}

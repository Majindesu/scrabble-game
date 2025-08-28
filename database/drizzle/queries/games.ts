import { eq, and } from "drizzle-orm";
import type { dbPostgres } from "../db";
import { games, type Game, type GameInsert } from "../schema/games";
import { gamePlayers, type GamePlayer, type GamePlayerInsert } from "../schema/game_players";
import { gameMoves, type GameMove, type GameMoveInsert } from "../schema/game_moves";
import { initializeBoard } from "../../../lib/game/board";
import { createTileBag } from "../../../lib/game/tiles";

/**
 * Create a new game
 */
export async function createGame(
  db: ReturnType<typeof dbPostgres>,
  gameData: Partial<GameInsert> = {}
): Promise<Game> {
  const newGameData: GameInsert = {
    status: 'waiting',
    boardState: initializeBoard(),
    bagTiles: createTileBag(),
    maxPlayers: 4,
    ...gameData,
  };

  const [game] = await db.insert(games).values(newGameData).returning();
  return game;
}

/**
 * Get game by ID with players
 */
export async function getGameWithPlayers(
  db: ReturnType<typeof dbPostgres>,
  gameId: number
): Promise<(Game & { players: GamePlayer[] }) | null> {
  const [game] = await db.select().from(games).where(eq(games.id, gameId));
  
  if (!game) return null;
  
  const players = await db
    .select()
    .from(gamePlayers)
    .where(eq(gamePlayers.gameId, gameId))
    .orderBy(gamePlayers.turnOrder);
  
  return { ...game, players };
}

/**
 * Add player to game
 */
export async function addPlayerToGame(
  db: ReturnType<typeof dbPostgres>,
  gameId: number,
  userId: string,
  playerName: string = `Player ${Date.now()}`
): Promise<GamePlayer | null> {
  // Check if game exists and has space
  const [game] = await db.select().from(games).where(eq(games.id, gameId));
  if (!game || game.status !== 'waiting') return null;
  
  // Check current player count
  const existingPlayers = await db
    .select()
    .from(gamePlayers)
    .where(eq(gamePlayers.gameId, gameId));
  
  if (existingPlayers.length >= game.maxPlayers) return null;
  
  // Check if user is already in the game
  const existingPlayer = existingPlayers.find(p => p.userId === userId);
  if (existingPlayer) return existingPlayer;
  
  const playerData: GamePlayerInsert = {
    gameId,
    userId,
    playerNumber: existingPlayers.length + 1,
    turnOrder: existingPlayers.length,
    tiles: [],
    score: 0,
  };
  
  const [newPlayer] = await db.insert(gamePlayers).values(playerData).returning();
  return newPlayer;
}

/**
 * Start game (deal initial tiles, set first player)
 */
export async function startGame(
  db: ReturnType<typeof dbPostgres>,
  gameId: number
): Promise<boolean> {
  const gameWithPlayers = await getGameWithPlayers(db, gameId);
  if (!gameWithPlayers || gameWithPlayers.status !== 'waiting') return false;
  
  // Need at least 2 players
  if (gameWithPlayers.players.length < 2) return false;
  
  let currentBag = [...gameWithPlayers.bagTiles];
  
  // Deal 7 tiles to each player
  for (const player of gameWithPlayers.players) {
    const playerTiles = currentBag.splice(0, 7);
    
    await db
      .update(gamePlayers)
      .set({ tiles: playerTiles })
      .where(eq(gamePlayers.id, player.id));
  }
  
  // Update game status and bag
  await db
    .update(games)
    .set({
      status: 'active',
      currentPlayerTurn: 1, // First player
      bagTiles: currentBag,
      updatedAt: new Date(),
    })
    .where(eq(games.id, gameId));
  
  return true;
}

/**
 * Update game state after a move
 */
export async function updateGameState(
  db: ReturnType<typeof dbPostgres>,
  gameId: number,
  updates: Partial<GameInsert>
): Promise<boolean> {
  try {
    await db
      .update(games)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(games.id, gameId));
    return true;
  } catch (error) {
    console.error('Error updating game state:', error);
    return false;
  }
}

/**
 * Update player data
 */
export async function updatePlayer(
  db: ReturnType<typeof dbPostgres>,
  playerId: number,
  updates: Partial<GamePlayerInsert>
): Promise<boolean> {
  try {
    await db
      .update(gamePlayers)
      .set(updates)
      .where(eq(gamePlayers.id, playerId));
    return true;
  } catch (error) {
    console.error('Error updating player:', error);
    return false;
  }
}

/**
 * Record a game move
 */
export async function recordMove(
  db: ReturnType<typeof dbPostgres>,
  moveData: GameMoveInsert
): Promise<GameMove | null> {
  try {
    const [move] = await db.insert(gameMoves).values(moveData).returning();
    return move;
  } catch (error) {
    console.error('Error recording move:', error);
    return null;
  }
}

/**
 * Get game moves history
 */
export async function getGameMoves(
  db: ReturnType<typeof dbPostgres>,
  gameId: number
): Promise<GameMove[]> {
  return await db
    .select()
    .from(gameMoves)
    .where(eq(gameMoves.gameId, gameId))
    .orderBy(gameMoves.timestamp);
}

/**
 * Get active games
 */
export async function getActiveGames(
  db: ReturnType<typeof dbPostgres>
): Promise<(Game & { playerCount: number })[]> {
  // This is a simplified version - would need proper join in production
  const activeGames = await db
    .select()
    .from(games)
    .where(eq(games.status, 'active'));
  
  const gamesWithPlayerCount = [];
  for (const game of activeGames) {
    const players = await db
      .select()
      .from(gamePlayers)
      .where(eq(gamePlayers.gameId, game.id));
    
    gamesWithPlayerCount.push({
      ...game,
      playerCount: players.length
    });
  }
  
  return gamesWithPlayerCount;
}

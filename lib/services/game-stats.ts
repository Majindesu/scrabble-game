import { dbPostgres } from '../../database/drizzle/db';
import { gameHistory, playerStats, gameMoves, type NewGameHistory, type NewPlayerStats, type NewGameMove } from '../../database/drizzle/schema/game-stats';
import { eq, desc, sql } from 'drizzle-orm';
import type { MultiplayerGame } from '../../server/websocket-handler';

export class GameStatsService {
  private db = dbPostgres();

  // Record a completed game
  async recordCompletedGame(game: MultiplayerGame, winnerPlayer?: { id: string; name: string }) {
    const gameDuration = Math.floor((Date.now() - game.createdAt.getTime()) / 1000 / 60); // minutes
    
    const gameRecord: NewGameHistory = {
      gameId: game.id,
      playerIds: game.players.map(p => p.id),
      playerNames: game.players.map(p => p.name),
      finalScores: Object.fromEntries(game.players.map(p => [p.id, p.score])),
      winnerId: winnerPlayer?.id,
      winnerName: winnerPlayer?.name,
      gameStatus: 'finished',
      gameDuration,
      totalMoves: 0, // Will be calculated from moves
    };

    await this.db.insert(gameHistory).values(gameRecord);

    // Update player statistics
    for (const player of game.players) {
      await this.updatePlayerStats(player.id, player.name, player.score, winnerPlayer?.id === player.id);
    }
  }

  // Record a game move
  async recordGameMove(gameId: string, playerId: string, playerName: string, moveData: {
    moveNumber: number;
    moveType: 'word' | 'exchange' | 'pass';
    word?: string;
    score: number;
    tiles?: Array<{ letter: string; row: number; col: number }>;
    boardState?: any;
  }) {
    const move: NewGameMove = {
      gameId,
      playerId,
      playerName,
      ...moveData,
    };

    await this.db.insert(gameMoves).values(move);
  }

  // Update player statistics
  private async updatePlayerStats(playerId: string, playerName: string, gameScore: number, isWinner: boolean) {
    const existing = await this.db
      .select()
      .from(playerStats)
      .where(eq(playerStats.playerId, playerId))
      .limit(1);

    if (existing.length === 0) {
      // Create new player stats
      const newStats: NewPlayerStats = {
        playerId,
        playerName,
        gamesPlayed: 1,
        gamesWon: isWinner ? 1 : 0,
        gamesLost: isWinner ? 0 : 1,
        totalScore: gameScore,
        highestScore: gameScore,
        averageScore: gameScore,
      };
      await this.db.insert(playerStats).values(newStats);
    } else {
      // Update existing stats
      const stats = existing[0];
      const newGamesPlayed = stats.gamesPlayed + 1;
      const newTotalScore = stats.totalScore + gameScore;
      const newAverageScore = Math.floor(newTotalScore / newGamesPlayed);

      await this.db
        .update(playerStats)
        .set({
          gamesPlayed: newGamesPlayed,
          gamesWon: isWinner ? stats.gamesWon + 1 : stats.gamesWon,
          gamesLost: isWinner ? stats.gamesLost : stats.gamesLost + 1,
          totalScore: newTotalScore,
          highestScore: Math.max(stats.highestScore, gameScore),
          averageScore: newAverageScore,
          lastPlayed: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(playerStats.playerId, playerId));
    }
  }

  // Get player statistics
  async getPlayerStats(playerId: string) {
    const stats = await this.db
      .select()
      .from(playerStats)
      .where(eq(playerStats.playerId, playerId))
      .limit(1);

    return stats[0] || null;
  }

  // Get player game history
  async getPlayerGameHistory(playerId: string, limit = 10) {
    return await this.db
      .select()
      .from(gameHistory)
      .where(sql`${gameHistory.playerIds}::jsonb ? ${playerId}`)
      .orderBy(desc(gameHistory.completedAt))
      .limit(limit);
  }

  // Get leaderboard
  async getLeaderboard(limit = 10) {
    return await this.db
      .select()
      .from(playerStats)
      .orderBy(desc(playerStats.gamesWon), desc(playerStats.averageScore))
      .limit(limit);
  }

  // Get game moves for replay
  async getGameMoves(gameId: string) {
    return await this.db
      .select()
      .from(gameMoves)
      .where(eq(gameMoves.gameId, gameId))
      .orderBy(gameMoves.moveNumber);
  }
}

export const gameStatsService = new GameStatsService();

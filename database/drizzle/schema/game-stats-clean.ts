import {
	pgTable,
	uuid,
	varchar,
	integer,
	timestamp,
	json,
} from "drizzle-orm/pg-core";

export const gameHistory = pgTable("game_history", {
	id: uuid("id").primaryKey().defaultRandom(),
	gameId: varchar("game_id", { length: 255 }).notNull(),
	playerIds: json("player_ids").notNull(), // Array of player IDs
	playerNames: json("player_names").notNull(), // Array of player names
	finalScores: json("final_scores").notNull(), // Object with playerId -> score mapping
	winnerId: varchar("winner_id", { length: 255 }),
	winnerName: varchar("winner_name", { length: 255 }),
	gameStatus: varchar("game_status", { length: 50 }).notNull(), // 'completed', 'abandoned', etc.
	gameDuration: integer("game_duration"), // Duration in seconds
	totalMoves: integer("total_moves").notNull().default(0),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	completedAt: timestamp("completed_at").defaultNow(),
});

export const playerStats = pgTable("player_stats", {
	id: uuid("id").primaryKey().defaultRandom(),
	playerId: varchar("player_id", { length: 255 }).notNull(),
	playerName: varchar("player_name", { length: 255 }).notNull(),
	gamesPlayed: integer("games_played").notNull().default(0),
	gamesWon: integer("games_won").notNull().default(0),
	gamesLost: integer("games_lost").notNull().default(0),
	totalScore: integer("total_score").notNull().default(0),
	highestScore: integer("highest_score").notNull().default(0),
	averageScore: integer("average_score").notNull().default(0),
	bestWord: varchar("best_word", { length: 100 }),
	bestWordScore: integer("best_word_score").notNull().default(0),
	lastPlayed: timestamp("last_played").defaultNow(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Separate detailed moves table for statistics (doesn't conflict with existing game_moves)
export const gameMovesHistory = pgTable("game_moves_history", {
	id: uuid("id").primaryKey().defaultRandom(),
	gameId: varchar("game_id", { length: 255 }).notNull(),
	playerId: varchar("player_id", { length: 255 }).notNull(),
	playerName: varchar("player_name", { length: 255 }).notNull(),
	moveNumber: integer("move_number").notNull(),
	moveType: varchar("move_type", { length: 50 }).notNull(), // 'play', 'pass', 'exchange'
	word: varchar("word", { length: 100 }), // Word played (if any)
	score: integer("score").notNull().default(0),
	tiles: json("tiles"), // Tiles used/exchanged as array
	positions: json("positions"), // Board positions as array of {row, col, letter}
	boardState: json("board_state"), // Full board state after move
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

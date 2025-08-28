import { pgTable, serial, integer, varchar, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { games } from "./games";
import { gamePlayers } from "./game_players";

export const gameMoves = pgTable("game_moves", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  playerId: integer("player_id").notNull().references(() => gamePlayers.id),
  moveType: varchar("move_type", { length: 20 }).notNull(), // place_word, exchange_tiles, pass
  wordPlayed: varchar("word_played", { length: 15 }), // main word formed (null for exchange/pass)
  tilesUsed: jsonb("tiles_used").$type<TileUsed[]>(), // tiles placed or exchanged
  boardPositions: jsonb("board_positions").$type<BoardPosition[]>(), // where tiles were placed
  scoreEarned: integer("score_earned").notNull().default(0),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export interface TileUsed {
  letter: string;
  points: number;
  isBlank?: boolean;
  originalLetter?: string; // for blank tiles, what letter it represented before
}

export interface BoardPosition {
  row: number; // 0-14
  col: number; // 0-14
  tile: {
    letter: string;
    points: number;
    isBlank?: boolean;
  };
}

export type GameMove = typeof gameMoves.$inferSelect;
export type GameMoveInsert = typeof gameMoves.$inferInsert;

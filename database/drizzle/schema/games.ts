import { pgTable, serial, varchar, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  status: varchar("status", { length: 20 }).notNull().default("waiting"), // waiting, active, finished, paused
  currentPlayerTurn: integer("current_player_turn"), // references player_number in game_players
  boardState: jsonb("board_state").$type<BoardCell[][]>().notNull(), // 15x15 board state
  bagTiles: jsonb("bag_tiles").$type<string[]>().notNull(), // remaining tiles in bag
  maxPlayers: integer("max_players").notNull().default(4),
  gameSettings: jsonb("game_settings").$type<GameSettings>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gameSettings = {
  timeLimit: 0, // 0 for unlimited, or seconds per turn
  allowBlankTiles: true,
  allowChallenges: true,
  customRules: {} as Record<string, any>,
};

export type GameSettings = typeof gameSettings;

export interface BoardCell {
  tile?: {
    letter: string;
    points: number;
    isBlank?: boolean; // if it's a blank tile representing this letter
    playerId?: number; // who placed this tile
  };
  premium?: 'DL' | 'TL' | 'DW' | 'TW' | 'STAR'; // Double Letter, Triple Letter, Double Word, Triple Word, Center Star
  isNew?: boolean; // if tile was placed this turn
}

export type Game = typeof games.$inferSelect;
export type GameInsert = typeof games.$inferInsert;

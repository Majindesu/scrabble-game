import { pgTable, serial, integer, varchar, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { games } from "./games";

export const gamePlayers = pgTable("game_players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  userId: varchar("user_id", { length: 255 }).notNull(), // For now, using string IDs
  playerNumber: integer("player_number").notNull(), // 1, 2, 3, or 4
  tiles: jsonb("tiles").$type<string[]>().notNull().default([]), // current tiles in rack (max 7)
  score: integer("score").notNull().default(0),
  turnOrder: integer("turn_order").notNull(), // order of play (0-based)
  isActive: boolean("is_active").notNull().default(true), // if player is still in game
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export type GamePlayer = typeof gamePlayers.$inferSelect;
export type GamePlayerInsert = typeof gamePlayers.$inferInsert;

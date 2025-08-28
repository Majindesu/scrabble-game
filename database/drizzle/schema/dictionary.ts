import { pgTable, serial, varchar, text, integer, boolean, index } from "drizzle-orm/pg-core";

export const dictionary = pgTable("dictionary", {
  id: serial("id").primaryKey(),
  word: varchar("word", { length: 15 }).notNull().unique(),
  definition: text("definition"), // optional, can be added later
  length: integer("length").notNull(),
  isValid: boolean("is_valid").notNull().default(true),
}, (table) => ({
  wordIdx: index("word_idx").on(table.word),
  lengthIdx: index("length_idx").on(table.length),
}));

export type DictionaryWord = typeof dictionary.$inferSelect;
export type DictionaryWordInsert = typeof dictionary.$inferInsert;

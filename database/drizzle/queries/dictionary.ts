import { like } from "drizzle-orm";
import type { dbPostgres } from "../db";
import { dictionary, type DictionaryWord, type DictionaryWordInsert } from "../schema/dictionary";

/**
 * Check if a word exists in the dictionary
 */
export async function isWordValid(
  db: ReturnType<typeof dbPostgres>,
  word: string
): Promise<boolean> {
  const [result] = await db
    .select()
    .from(dictionary)
    .where(like(dictionary.word, word.toUpperCase()))
    .limit(1);
  
  return result?.isValid ?? false;
}

/**
 * Add word to dictionary
 */
export async function addWord(
  db: ReturnType<typeof dbPostgres>,
  word: string,
  definition?: string
): Promise<DictionaryWord | null> {
  try {
    const wordData: DictionaryWordInsert = {
      word: word.toUpperCase(),
      definition,
      length: word.length,
      isValid: true,
    };
    
    const [newWord] = await db.insert(dictionary).values(wordData).returning();
    return newWord;
  } catch (error) {
    console.error('Error adding word to dictionary:', error);
    return null;
  }
}

/**
 * Batch insert words into dictionary (useful for initial setup)
 */
export async function addWordsToDict(
  db: ReturnType<typeof dbPostgres>,
  words: string[]
): Promise<number> {
  try {
    const wordData: DictionaryWordInsert[] = words.map(word => ({
      word: word.toUpperCase(),
      length: word.length,
      isValid: true,
    }));
    
    await db.insert(dictionary).values(wordData).onConflictDoNothing();
    return words.length;
  } catch (error) {
    console.error('Error batch inserting words:', error);
    return 0;
  }
}

/**
 * Get word definition
 */
export async function getWordDefinition(
  db: ReturnType<typeof dbPostgres>,
  word: string
): Promise<string | null> {
  const [result] = await db
    .select()
    .from(dictionary)
    .where(like(dictionary.word, word.toUpperCase()))
    .limit(1);
  
  return result?.definition ?? null;
}

/**
 * Search words by pattern (useful for word suggestions)
 */
export async function searchWords(
  db: ReturnType<typeof dbPostgres>,
  pattern: string,
  limit: number = 20
): Promise<DictionaryWord[]> {
  return await db
    .select()
    .from(dictionary)
    .where(like(dictionary.word, pattern.toUpperCase()))
    .limit(limit);
}

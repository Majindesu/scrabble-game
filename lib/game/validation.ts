import { eq } from "drizzle-orm";
import { dbPostgres } from "../../database/drizzle/db";
import { dictionary } from "../../database/drizzle/schema/dictionary";
import { BoardCell } from "../../database/drizzle/schema/games";
import { getWordsFormed, tilesConnectToExisting } from "./board";

/**
 * Validate if a word exists in the dictionary
 */
export async function isValidWord(word: string, db = dbPostgres()): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(dictionary)
      .where(eq(dictionary.word, word.toUpperCase()))
      .limit(1);
    
    return result.length > 0 && result[0].isValid;
  } catch (error) {
    console.error('Error checking word validity:', error);
    return false;
  }
}

/**
 * Validate multiple words at once
 */
export async function validateWords(words: string[], db = dbPostgres()): Promise<{
  valid: boolean;
  invalidWords: string[];
  validWords: string[];
}> {
  const validWords: string[] = [];
  const invalidWords: string[] = [];
  
  for (const word of words) {
    const isValid = await isValidWord(word, db);
    if (isValid) {
      validWords.push(word);
    } else {
      invalidWords.push(word);
    }
  }
  
  return {
    valid: invalidWords.length === 0,
    invalidWords,
    validWords
  };
}

/**
 * Comprehensive move validation
 */
export async function validateMove(
  board: BoardCell[][],
  newTilePositions: { row: number; col: number; tile: { letter: string; points: number; isBlank?: boolean } }[],
  isFirstMove: boolean = false,
  db = dbPostgres()
): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
  wordsFormed: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let wordsFormed: string[] = [];
  
  // Basic validation
  if (newTilePositions.length === 0) {
    errors.push("No tiles placed");
    return { valid: false, errors, warnings, wordsFormed };
  }
  
  // Create temporary board for validation
  const tempBoard = board.map(row => row.map(cell => ({ ...cell })));
  for (const pos of newTilePositions) {
    if (tempBoard[pos.row][pos.col].tile) {
      errors.push(`Position ${pos.row + 1},${pos.col + 1} is already occupied`);
      continue;
    }
    tempBoard[pos.row][pos.col].tile = pos.tile;
  }
  
  if (errors.length > 0) {
    return { valid: false, errors, warnings, wordsFormed };
  }
  
  // Check tile connectivity
  const positions = newTilePositions.map(p => ({ row: p.row, col: p.col }));
  if (!tilesConnectToExisting(tempBoard, positions)) {
    if (isFirstMove) {
      errors.push("First move must cross the center star (H8)");
    } else {
      errors.push("New tiles must connect to existing tiles on the board");
    }
  }
  
  // Get all words formed by this move
  try {
    wordsFormed = getWordsFormed(tempBoard, positions);
    
    // Must form at least one word
    if (wordsFormed.length === 0) {
      errors.push("Move must form at least one valid word");
    }
    
    // Validate all formed words
    const wordValidation = await validateWords(wordsFormed, db);
    if (!wordValidation.valid) {
      errors.push(`Invalid words: ${wordValidation.invalidWords.join(', ')}`);
    }
    
  } catch (error) {
    errors.push("Error validating words formed");
    console.error('Word validation error:', error);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    wordsFormed
  };
}

/**
 * Check if tiles are placed in a single line (horizontal or vertical)
 */
export function tilesFormStraightLine(positions: { row: number; col: number }[]): boolean {
  if (positions.length <= 1) return true;
  
  const firstRow = positions[0].row;
  const firstCol = positions[0].col;
  
  const isHorizontal = positions.every(pos => pos.row === firstRow);
  const isVertical = positions.every(pos => pos.col === firstCol);
  
  return isHorizontal || isVertical;
}

/**
 * Check if tiles are placed consecutively (no gaps)
 */
export function tilesAreConsecutive(
  board: BoardCell[][],
  positions: { row: number; col: number }[]
): boolean {
  if (positions.length <= 1) return true;
  
  // Sort positions
  const sortedPositions = [...positions].sort((a, b) => 
    a.row === b.row ? a.col - b.col : a.row - b.row
  );
  
  const isHorizontal = sortedPositions.every(pos => pos.row === sortedPositions[0].row);
  
  if (isHorizontal) {
    // Check horizontal consecutiveness
    const row = sortedPositions[0].row;
    const startCol = sortedPositions[0].col;
    const endCol = sortedPositions[sortedPositions.length - 1].col;
    
    for (let col = startCol; col <= endCol; col++) {
      if (!board[row][col].tile) {
        return false;
      }
    }
  } else {
    // Check vertical consecutiveness
    const col = sortedPositions[0].col;
    const startRow = sortedPositions[0].row;
    const endRow = sortedPositions[sortedPositions.length - 1].row;
    
    for (let row = startRow; row <= endRow; row++) {
      if (!board[row][col].tile) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Validate exchange move
 */
export function validateExchange(
  tilesToExchange: string[],
  playerTiles: string[],
  bagSize: number
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (tilesToExchange.length === 0) {
    errors.push("Must select at least one tile to exchange");
  }
  
  if (tilesToExchange.length > playerTiles.length) {
    errors.push("Cannot exchange more tiles than you have");
  }
  
  if (bagSize < tilesToExchange.length) {
    errors.push("Not enough tiles in bag for exchange");
  }
  
  // Check if player has all the tiles they want to exchange
  const playerTilesCopy = [...playerTiles];
  for (const tile of tilesToExchange) {
    const index = playerTilesCopy.indexOf(tile);
    if (index === -1) {
      errors.push(`You don't have the tile: ${tile}`);
    } else {
      playerTilesCopy.splice(index, 1);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get word definition (optional feature)
 */
export async function getWordDefinition(word: string, db = dbPostgres()): Promise<string | null> {
  try {
    const result = await db
      .select()
      .from(dictionary)
      .where(eq(dictionary.word, word.toUpperCase()))
      .limit(1);
    
    return result.length > 0 ? result[0].definition : null;
  } catch (error) {
    console.error('Error fetching word definition:', error);
    return null;
  }
}

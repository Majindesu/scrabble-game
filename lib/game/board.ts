import { BoardCell } from "../../database/drizzle/schema/games";
import { BOARD_SIZE, CENTER_POSITION, PREMIUM_SQUARES, PremiumSquareType } from "./constants";

/**
 * Initialize an empty 15x15 Scrabble board with premium squares
 */
export function initializeBoard(): BoardCell[][] {
  const board: BoardCell[][] = [];
  
  // Create empty board
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      board[row][col] = {};
    }
  }
  
  // Add premium squares
  for (const premiumSquare of PREMIUM_SQUARES) {
    board[premiumSquare.row][premiumSquare.col].premium = premiumSquare.type as PremiumSquareType;
  }
  
  return board;
}

/**
 * Check if a position is valid on the board
 */
export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/**
 * Check if a position is empty on the board
 */
export function isEmptyPosition(board: BoardCell[][], row: number, col: number): boolean {
  if (!isValidPosition(row, col)) return false;
  return !board[row][col].tile;
}

/**
 * Check if a position has a tile
 */
export function hasTile(board: BoardCell[][], row: number, col: number): boolean {
  if (!isValidPosition(row, col)) return false;
  return !!board[row][col].tile;
}

/**
 * Place a tile on the board
 */
export function placeTile(
  board: BoardCell[][], 
  row: number, 
  col: number, 
  tile: { letter: string; points: number; isBlank?: boolean; playerId?: number }
): BoardCell[][] {
  if (!isValidPosition(row, col)) {
    throw new Error(`Invalid position: ${row}, ${col}`);
  }
  
  if (board[row][col].tile) {
    throw new Error(`Position ${row}, ${col} already occupied`);
  }
  
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  newBoard[row][col].tile = { ...tile };
  newBoard[row][col].isNew = true; // Mark as newly placed
  
  return newBoard;
}

/**
 * Remove a tile from the board
 */
export function removeTile(board: BoardCell[][], row: number, col: number): BoardCell[][] {
  if (!isValidPosition(row, col)) {
    throw new Error(`Invalid position: ${row}, ${col}`);
  }
  
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  delete newBoard[row][col].tile;
  delete newBoard[row][col].isNew;
  
  return newBoard;
}

/**
 * Get all words formed by a move (including cross-words)
 */
export function getWordsFormed(
  board: BoardCell[][], 
  newTilePositions: { row: number; col: number }[]
): string[] {
  const words: string[] = [];
  
  // Find the main word (horizontal or vertical)
  const mainWord = findMainWord(board, newTilePositions);
  if (mainWord && mainWord.length > 1) {
    words.push(mainWord);
  }
  
  // Find cross-words formed by each new tile
  for (const pos of newTilePositions) {
    const crossWords = findCrossWords(board, pos.row, pos.col);
    words.push(...crossWords.filter(word => word.length > 1));
  }
  
  return words;
}

/**
 * Find the main word formed (either horizontal or vertical)
 */
function findMainWord(board: BoardCell[][], newTilePositions: { row: number; col: number }[]): string {
  if (newTilePositions.length === 0) return '';
  
  // Sort positions to determine direction
  const sortedPositions = [...newTilePositions].sort((a, b) => 
    a.row === b.row ? a.col - b.col : a.row - b.row
  );
  
  const isHorizontal = sortedPositions.every(pos => pos.row === sortedPositions[0].row);
  const isVertical = sortedPositions.every(pos => pos.col === sortedPositions[0].col);
  
  if (isHorizontal) {
    return getHorizontalWord(board, sortedPositions[0].row, sortedPositions[0].col);
  } else if (isVertical) {
    return getVerticalWord(board, sortedPositions[0].row, sortedPositions[0].col);
  }
  
  return '';
}

/**
 * Find cross-words formed by a single tile placement
 */
function findCrossWords(board: BoardCell[][], row: number, col: number): string[] {
  const words: string[] = [];
  
  // Check horizontal word
  const horizontalWord = getHorizontalWord(board, row, col);
  if (horizontalWord.length > 1) {
    words.push(horizontalWord);
  }
  
  // Check vertical word
  const verticalWord = getVerticalWord(board, row, col);
  if (verticalWord.length > 1) {
    words.push(verticalWord);
  }
  
  return words;
}

/**
 * Get the complete horizontal word containing the given position
 */
function getHorizontalWord(board: BoardCell[][], row: number, col: number): string {
  // Find start of word
  let startCol = col;
  while (startCol > 0 && hasTile(board, row, startCol - 1)) {
    startCol--;
  }
  
  // Find end of word
  let endCol = col;
  while (endCol < BOARD_SIZE - 1 && hasTile(board, row, endCol + 1)) {
    endCol++;
  }
  
  // Build word
  let word = '';
  for (let c = startCol; c <= endCol; c++) {
    if (hasTile(board, row, c)) {
      word += board[row][c].tile!.letter;
    }
  }
  
  return word;
}

/**
 * Get the complete vertical word containing the given position
 */
function getVerticalWord(board: BoardCell[][], row: number, col: number): string {
  // Find start of word
  let startRow = row;
  while (startRow > 0 && hasTile(board, startRow - 1, col)) {
    startRow--;
  }
  
  // Find end of word
  let endRow = row;
  while (endRow < BOARD_SIZE - 1 && hasTile(board, endRow + 1, col)) {
    endRow++;
  }
  
  // Build word
  let word = '';
  for (let r = startRow; r <= endRow; r++) {
    if (hasTile(board, r, col)) {
      word += board[r][col].tile!.letter;
    }
  }
  
  return word;
}

/**
 * Check if the first move crosses the center star
 */
export function firstMoveCrossesCenter(positions: { row: number; col: number }[]): boolean {
  return positions.some(pos => pos.row === CENTER_POSITION && pos.col === CENTER_POSITION);
}

/**
 * Check if new tiles connect to existing tiles on the board
 */
export function tilesConnectToExisting(
  board: BoardCell[][], 
  newTilePositions: { row: number; col: number }[]
): boolean {
  // If board is empty, tiles must include center position
  const hasExistingTiles = board.some(row => row.some(cell => cell.tile));
  if (!hasExistingTiles) {
    return firstMoveCrossesCenter(newTilePositions);
  }
  
  // Check if any new tile is adjacent to an existing tile
  for (const pos of newTilePositions) {
    const adjacentPositions = [
      { row: pos.row - 1, col: pos.col }, // up
      { row: pos.row + 1, col: pos.col }, // down
      { row: pos.row, col: pos.col - 1 }, // left
      { row: pos.row, col: pos.col + 1 }, // right
    ];
    
    for (const adjPos of adjacentPositions) {
      if (isValidPosition(adjPos.row, adjPos.col) && hasTile(board, adjPos.row, adjPos.col)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Clear the "isNew" flag from all tiles (call after move is confirmed)
 */
export function clearNewTileFlags(board: BoardCell[][]): BoardCell[][] {
  return board.map(row => 
    row.map(cell => ({
      ...cell,
      isNew: false
    }))
  );
}

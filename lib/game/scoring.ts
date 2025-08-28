import { BoardCell } from "../../database/drizzle/schema/games";
import { BONUS_ALL_TILES, MAX_TILES_IN_RACK } from "./constants";
import { getLetterPoints } from "./tiles";

/**
 * Calculate the score for a word placement
 */
export function calculateMoveScore(
  board: BoardCell[][],
  newTilePositions: { row: number; col: number; tile: { letter: string; points: number; isBlank?: boolean } }[]
): {
  totalScore: number;
  wordScores: Array<{ word: string; score: number; positions: { row: number; col: number }[] }>;
  usedAllTiles: boolean;
} {
  const wordScores: Array<{ word: string; score: number; positions: { row: number; col: number }[] }> = [];
  let totalScore = 0;
  
  // Create a temporary board with new tiles placed
  const tempBoard = createTempBoard(board, newTilePositions);
  
  // Find all words formed
  const wordsFormed = findAllWordsFormed(tempBoard, newTilePositions);
  
  for (const wordInfo of wordsFormed) {
    const wordScore = calculateWordScore(tempBoard, wordInfo.positions, newTilePositions);
    wordScores.push({
      word: wordInfo.word,
      score: wordScore,
      positions: wordInfo.positions
    });
    totalScore += wordScore;
  }
  
  // Check for bonus (using all 7 tiles)
  const usedAllTiles = newTilePositions.length === MAX_TILES_IN_RACK;
  if (usedAllTiles) {
    totalScore += BONUS_ALL_TILES;
  }
  
  return {
    totalScore,
    wordScores,
    usedAllTiles
  };
}

/**
 * Create a temporary board with new tiles placed for scoring calculations
 */
function createTempBoard(
  board: BoardCell[][],
  newTilePositions: { row: number; col: number; tile: { letter: string; points: number; isBlank?: boolean } }[]
): BoardCell[][] {
  const tempBoard = board.map(row => row.map(cell => ({ ...cell })));
  
  for (const pos of newTilePositions) {
    tempBoard[pos.row][pos.col].tile = { ...pos.tile };
    tempBoard[pos.row][pos.col].isNew = true;
  }
  
  return tempBoard;
}

/**
 * Find all words formed by the new tile placements
 */
function findAllWordsFormed(
  board: BoardCell[][],
  newTilePositions: { row: number; col: number }[]
): Array<{ word: string; positions: { row: number; col: number }[] }> {
  const words: Array<{ word: string; positions: { row: number; col: number }[] }> = [];
  const processedWords = new Set<string>();
  
  // Check the main word (horizontal or vertical alignment)
  const mainWord = findMainWordInfo(board, newTilePositions);
  if (mainWord && mainWord.word.length > 1) {
    const wordKey = `${mainWord.positions[0].row}-${mainWord.positions[0].col}-${mainWord.word}`;
    if (!processedWords.has(wordKey)) {
      words.push(mainWord);
      processedWords.add(wordKey);
    }
  }
  
  // Check cross-words formed by each new tile
  for (const pos of newTilePositions) {
    const crossWords = findCrossWordsAt(board, pos.row, pos.col);
    for (const crossWord of crossWords) {
      if (crossWord.word.length > 1) {
        const wordKey = `${crossWord.positions[0].row}-${crossWord.positions[0].col}-${crossWord.word}`;
        if (!processedWords.has(wordKey)) {
          words.push(crossWord);
          processedWords.add(wordKey);
        }
      }
    }
  }
  
  return words;
}

/**
 * Calculate the score for a specific word
 */
function calculateWordScore(
  board: BoardCell[][],
  wordPositions: { row: number; col: number }[],
  newTilePositions: { row: number; col: number }[]
): number {
  let wordScore = 0;
  let wordMultiplier = 1;
  
  for (const pos of wordPositions) {
    const cell = board[pos.row][pos.col];
    if (!cell.tile) continue;
    
    let letterScore = cell.tile.points;
    const isNewTile = newTilePositions.some(newPos => newPos.row === pos.row && newPos.col === pos.col);
    
    // Apply premium squares only for newly placed tiles
    if (isNewTile && cell.premium) {
      switch (cell.premium) {
        case 'DL':
          letterScore *= 2;
          break;
        case 'TL':
          letterScore *= 3;
          break;
        case 'DW':
        case 'STAR':
          wordMultiplier *= 2;
          break;
        case 'TW':
          wordMultiplier *= 3;
          break;
      }
    }
    
    wordScore += letterScore;
  }
  
  return wordScore * wordMultiplier;
}

/**
 * Find the main word formed (horizontal or vertical)
 */
function findMainWordInfo(
  board: BoardCell[][],
  newTilePositions: { row: number; col: number }[]
): { word: string; positions: { row: number; col: number }[] } | null {
  if (newTilePositions.length === 0) return null;
  
  // Determine if tiles are placed horizontally or vertically
  const firstRow = newTilePositions[0].row;
  const firstCol = newTilePositions[0].col;
  
  const isHorizontal = newTilePositions.every(pos => pos.row === firstRow);
  const isVertical = newTilePositions.every(pos => pos.col === firstCol);
  
  if (isHorizontal) {
    return getCompleteWordInfo(board, firstRow, firstCol, 'horizontal');
  } else if (isVertical) {
    return getCompleteWordInfo(board, firstRow, firstCol, 'vertical');
  }
  
  // For scattered tiles, find the longest word that includes new tiles
  // This is more complex and might require additional logic
  return null;
}

/**
 * Find cross-words formed at a specific position
 */
function findCrossWordsAt(
  board: BoardCell[][],
  row: number,
  col: number
): Array<{ word: string; positions: { row: number; col: number }[] }> {
  const words: Array<{ word: string; positions: { row: number; col: number }[] }> = [];
  
  // Check horizontal word
  const horizontalWord = getCompleteWordInfo(board, row, col, 'horizontal');
  if (horizontalWord && horizontalWord.word.length > 1) {
    words.push(horizontalWord);
  }
  
  // Check vertical word  
  const verticalWord = getCompleteWordInfo(board, row, col, 'vertical');
  if (verticalWord && verticalWord.word.length > 1) {
    words.push(verticalWord);
  }
  
  return words;
}

/**
 * Get complete word information (letters and positions) in a given direction
 */
function getCompleteWordInfo(
  board: BoardCell[][],
  row: number,
  col: number,
  direction: 'horizontal' | 'vertical'
): { word: string; positions: { row: number; col: number }[] } | null {
  const positions: { row: number; col: number }[] = [];
  let word = '';
  
  if (direction === 'horizontal') {
    // Find start of word
    let startCol = col;
    while (startCol > 0 && board[row][startCol - 1].tile) {
      startCol--;
    }
    
    // Find end of word and build it
    let currentCol = startCol;
    while (currentCol < board[row].length && board[row][currentCol].tile) {
      positions.push({ row, col: currentCol });
      word += board[row][currentCol].tile!.letter;
      currentCol++;
    }
  } else {
    // Find start of word
    let startRow = row;
    while (startRow > 0 && board[startRow - 1][col].tile) {
      startRow--;
    }
    
    // Find end of word and build it
    let currentRow = startRow;
    while (currentRow < board.length && board[currentRow][col].tile) {
      positions.push({ row: currentRow, col });
      word += board[currentRow][col].tile!.letter;
      currentRow++;
    }
  }
  
  return positions.length > 0 ? { word, positions } : null;
}

/**
 * Calculate final game scores (subtract remaining tile values)
 */
export function calculateFinalScores(
  playerScores: number[],
  playerTiles: string[][]
): number[] {
  const finalScores = [...playerScores];
  
  // Find player with no tiles (if any) - they get bonus points
  let emptyTilePlayerIndex = -1;
  let totalRemainingPoints = 0;
  
  for (let i = 0; i < playerTiles.length; i++) {
    if (playerTiles[i].length === 0) {
      emptyTilePlayerIndex = i;
    } else {
      // Subtract remaining tile values
      for (const tile of playerTiles[i]) {
        const points = getLetterPoints(tile);
        finalScores[i] -= points;
        totalRemainingPoints += points;
      }
    }
  }
  
  // Add bonus to player who finished first (if any)
  if (emptyTilePlayerIndex >= 0) {
    finalScores[emptyTilePlayerIndex] += totalRemainingPoints;
  }
  
  return finalScores;
}

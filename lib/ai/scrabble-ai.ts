import type { BoardCell } from '../../database/drizzle/schema/games';

export interface AIMove {
  word: string;
  tiles: Array<{ letter: string; row: number; col: number; points: number }>;
  score: number;
  direction: 'horizontal' | 'vertical';
}

export class ScrabbleAI {
  private dictionary: Set<string>;
  private difficultyLevel: 'easy' | 'medium' | 'hard';

  constructor(dictionary: string[], difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    this.dictionary = new Set(dictionary.map(word => word.toLowerCase()));
    this.difficultyLevel = difficulty;
  }

  // Main AI move calculation
  async calculateMove(board: BoardCell[][], tiles: Array<{ letter: string; points: number }>): Promise<AIMove | null> {
    const possibleMoves: AIMove[] = [];

    // Find all possible word placements
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        // Try horizontal placements
        const horizontalMoves = this.findWordsAtPosition(board, tiles, row, col, 'horizontal');
        possibleMoves.push(...horizontalMoves);

        // Try vertical placements
        const verticalMoves = this.findWordsAtPosition(board, tiles, row, col, 'vertical');
        possibleMoves.push(...verticalMoves);
      }
    }

    if (possibleMoves.length === 0) {
      return null; // No valid moves found
    }

    // Sort moves by score and apply difficulty-based selection
    possibleMoves.sort((a, b) => b.score - a.score);

    switch (this.difficultyLevel) {
      case 'easy':
        // Pick a random move from the bottom 30%
        const easyStart = Math.floor(possibleMoves.length * 0.7);
        return possibleMoves[easyStart + Math.floor(Math.random() * (possibleMoves.length - easyStart))];
      
      case 'medium':
        // Pick from top 60% of moves
        const mediumEnd = Math.floor(possibleMoves.length * 0.6);
        return possibleMoves[Math.floor(Math.random() * mediumEnd)];
      
      case 'hard':
        // Pick from top 20% of moves
        const hardEnd = Math.max(1, Math.floor(possibleMoves.length * 0.2));
        return possibleMoves[Math.floor(Math.random() * hardEnd)];
      
      default:
        return possibleMoves[0]; // Best move
    }
  }

  private findWordsAtPosition(
    board: BoardCell[][], 
    tiles: Array<{ letter: string; points: number }>, 
    row: number, 
    col: number, 
    direction: 'horizontal' | 'vertical'
  ): AIMove[] {
    const moves: AIMove[] = [];
    const maxTiles = Math.min(tiles.length, 7); // Can use up to 7 tiles

    // Try different combinations of tiles
    for (let numTiles = 1; numTiles <= maxTiles; numTiles++) {
      const tileCombinations = this.getCombinations(tiles, numTiles);

      for (const tileCombo of tileCombinations) {
        const permutations = this.getPermutations(tileCombo);

        for (const tilePerm of permutations) {
          const move = this.tryWordPlacement(board, tilePerm, row, col, direction);
          if (move && this.isValidWord(move.word)) {
            moves.push(move);
          }
        }
      }
    }

    return moves;
  }

  private tryWordPlacement(
    board: BoardCell[][],
    tiles: Array<{ letter: string; points: number }>,
    startRow: number,
    startCol: number,
    direction: 'horizontal' | 'vertical'
  ): AIMove | null {
    const placedTiles: Array<{ letter: string; row: number; col: number; points: number }> = [];
    let word = '';
    let score = 0;
    let wordMultiplier = 1;
    let touchesExistingTile = false;

    // Check if we can place tiles at this position
    for (let i = 0; i < tiles.length; i++) {
      const currentRow = direction === 'horizontal' ? startRow : startRow + i;
      const currentCol = direction === 'horizontal' ? startCol + i : startCol;

      // Check bounds
      if (currentRow >= 15 || currentCol >= 15) {
        return null;
      }

      const cell = board[currentRow][currentCol];

      if (cell.tile) {
        // Cell is occupied - can't place here in basic AI
        // In advanced AI, we'd try to build off existing tiles
        touchesExistingTile = true;
        word += cell.tile.letter;
      } else {
        // Empty cell - place our tile
        const tile = tiles[i];
        placedTiles.push({
          letter: tile.letter,
          row: currentRow,
          col: currentCol,
          points: tile.points
        });
        word += tile.letter;

        // Calculate score for this tile
        let tileScore = tile.points;

        // Apply letter multipliers
        if (cell.premium === 'DL') tileScore *= 2;
        if (cell.premium === 'TL') tileScore *= 3;

        score += tileScore;

        // Apply word multipliers
        if (cell.premium === 'DW') wordMultiplier *= 2;
        if (cell.premium === 'TW') wordMultiplier *= 3;
      }
    }

    // Must touch at least one existing tile (except for first move)
    const isEmpty = board.every(row => row.every(cell => !cell.tile));
    if (!isEmpty && !touchesExistingTile) {
      return null;
    }

    // Apply word multiplier
    score *= wordMultiplier;

    // Bonus for using all 7 tiles
    if (tiles.length === 7) {
      score += 50;
    }

    return {
      word: word.toLowerCase(),
      tiles: placedTiles,
      score,
      direction
    };
  }

  private isValidWord(word: string): boolean {
    return word.length >= 2 && this.dictionary.has(word.toLowerCase());
  }

  // Get all combinations of n items from array
  private getCombinations<T>(arr: T[], n: number): T[][] {
    if (n === 1) return arr.map(item => [item]);
    if (n === arr.length) return [arr];

    const result: T[][] = [];
    
    for (let i = 0; i <= arr.length - n; i++) {
      const rest = this.getCombinations(arr.slice(i + 1), n - 1);
      for (const combo of rest) {
        result.push([arr[i], ...combo]);
      }
    }

    return result;
  }

  // Get all permutations of array
  private getPermutations<T>(arr: T[]): T[][] {
    if (arr.length <= 1) return [arr];

    const result: T[][] = [];

    for (let i = 0; i < arr.length; i++) {
      const rest = arr.slice(0, i).concat(arr.slice(i + 1));
      const perms = this.getPermutations(rest);

      for (const perm of perms) {
        result.push([arr[i], ...perm]);
      }
    }

    return result;
  }

  // Should AI pass turn?
  shouldPass(tiles: Array<{ letter: string; points: number }>): boolean {
    // Simple logic: pass if we have too many high-value tiles and can't make words
    const highValueTiles = tiles.filter(tile => tile.points >= 5).length;
    return highValueTiles >= tiles.length * 0.7; // 70% high-value tiles
  }

  // Which tiles should AI exchange?
  chooseTilesToExchange(tiles: Array<{ letter: string; points: number }>): string[] {
    // Exchange high-value tiles that are hard to use
    return tiles
      .filter(tile => tile.points >= 8 || ['Q', 'X', 'Z'].includes(tile.letter))
      .slice(0, Math.min(3, tiles.length)) // Exchange up to 3 tiles
      .map(tile => tile.letter);
  }
}

// Simple word list for AI (in production, use a full dictionary)
export const BASIC_WORD_LIST = [
  'cat', 'dog', 'house', 'car', 'tree', 'book', 'water', 'fire', 'earth', 'air',
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'men', 'put', 'say', 'she', 'too', 'use',
  'word', 'work', 'year', 'back', 'call', 'came', 'each', 'find', 'good', 'hand', 'high', 'keep', 'kind', 'know', 'last', 'left', 'life', 'line', 'live', 'look', 'made', 'make', 'most', 'move', 'much', 'name', 'need', 'open', 'over', 'part', 'play', 'read', 'right', 'said', 'same', 'show', 'side', 'tell', 'time', 'turn', 'very', 'want', 'well', 'went', 'were', 'what', 'when', 'will', 'with', 'your',
  'about', 'after', 'again', 'along', 'begin', 'being', 'below', 'carry', 'clean', 'close', 'could', 'doing', 'every', 'first', 'found', 'great', 'group', 'house', 'learn', 'light', 'never', 'only', 'own', 'place', 'point', 'right', 'round', 'small', 'sound', 'still', 'such', 'take', 'thing', 'think', 'three', 'under', 'water', 'where', 'which', 'while', 'world', 'would', 'write', 'years'
];

// Scrabble game constants

// Standard Scrabble tile distribution
export const TILE_DISTRIBUTION = {
  A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2, I: 9, J: 1,
  K: 1, L: 4, M: 2, N: 6, O: 8, P: 2, Q: 1, R: 6, S: 4, T: 6,
  U: 4, V: 2, W: 2, X: 1, Y: 2, Z: 1, BLANK: 2
} as const;

// Standard Scrabble letter point values
export const LETTER_POINTS = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10, BLANK: 0
} as const;

// Board dimensions
export const BOARD_SIZE = 15;
export const CENTER_POSITION = 7; // H8 in chess notation

// Premium square layout (15x15 board)
export const PREMIUM_SQUARES = [
  // Triple Word Score
  { row: 0, col: 0, type: 'TW' }, { row: 0, col: 7, type: 'TW' }, { row: 0, col: 14, type: 'TW' },
  { row: 7, col: 0, type: 'TW' }, { row: 7, col: 14, type: 'TW' },
  { row: 14, col: 0, type: 'TW' }, { row: 14, col: 7, type: 'TW' }, { row: 14, col: 14, type: 'TW' },

  // Double Word Score
  { row: 1, col: 1, type: 'DW' }, { row: 1, col: 13, type: 'DW' },
  { row: 2, col: 2, type: 'DW' }, { row: 2, col: 12, type: 'DW' },
  { row: 3, col: 3, type: 'DW' }, { row: 3, col: 11, type: 'DW' },
  { row: 4, col: 4, type: 'DW' }, { row: 4, col: 10, type: 'DW' },
  { row: 10, col: 4, type: 'DW' }, { row: 10, col: 10, type: 'DW' },
  { row: 11, col: 3, type: 'DW' }, { row: 11, col: 11, type: 'DW' },
  { row: 12, col: 2, type: 'DW' }, { row: 12, col: 12, type: 'DW' },
  { row: 13, col: 1, type: 'DW' }, { row: 13, col: 13, type: 'DW' },

  // Triple Letter Score
  { row: 1, col: 5, type: 'TL' }, { row: 1, col: 9, type: 'TL' },
  { row: 5, col: 1, type: 'TL' }, { row: 5, col: 5, type: 'TL' }, { row: 5, col: 9, type: 'TL' }, { row: 5, col: 13, type: 'TL' },
  { row: 9, col: 1, type: 'TL' }, { row: 9, col: 5, type: 'TL' }, { row: 9, col: 9, type: 'TL' }, { row: 9, col: 13, type: 'TL' },
  { row: 13, col: 5, type: 'TL' }, { row: 13, col: 9, type: 'TL' },

  // Double Letter Score
  { row: 0, col: 3, type: 'DL' }, { row: 0, col: 11, type: 'DL' },
  { row: 2, col: 6, type: 'DL' }, { row: 2, col: 8, type: 'DL' },
  { row: 3, col: 0, type: 'DL' }, { row: 3, col: 7, type: 'DL' }, { row: 3, col: 14, type: 'DL' },
  { row: 6, col: 2, type: 'DL' }, { row: 6, col: 6, type: 'DL' }, { row: 6, col: 8, type: 'DL' }, { row: 6, col: 12, type: 'DL' },
  { row: 7, col: 3, type: 'DL' }, { row: 7, col: 11, type: 'DL' },
  { row: 8, col: 2, type: 'DL' }, { row: 8, col: 6, type: 'DL' }, { row: 8, col: 8, type: 'DL' }, { row: 8, col: 12, type: 'DL' },
  { row: 11, col: 0, type: 'DL' }, { row: 11, col: 7, type: 'DL' }, { row: 11, col: 14, type: 'DL' },
  { row: 12, col: 6, type: 'DL' }, { row: 12, col: 8, type: 'DL' },
  { row: 14, col: 3, type: 'DL' }, { row: 14, col: 11, type: 'DL' },

  // Center Star
  { row: 7, col: 7, type: 'STAR' },
] as const;

// Game rules constants
export const MAX_TILES_IN_RACK = 7;
export const BONUS_ALL_TILES = 50; // Points for using all 7 tiles in one turn
export const TOTAL_TILES = 100;

// Game status values
export const GAME_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  FINISHED: 'finished',
  PAUSED: 'paused',
} as const;

// Move types
export const MOVE_TYPES = {
  PLACE_WORD: 'place_word',
  EXCHANGE_TILES: 'exchange_tiles',
  PASS: 'pass',
} as const;

export type PremiumSquareType = 'DL' | 'TL' | 'DW' | 'TW' | 'STAR';
export type GameStatus = typeof GAME_STATUS[keyof typeof GAME_STATUS];
export type MoveType = typeof MOVE_TYPES[keyof typeof MOVE_TYPES];

// Helper function to get premium square type for a given position
export function getPremiumSquareType(row: number, col: number): PremiumSquareType | null {
  if (row === 7 && col === 7) {
    return 'STAR'; // Center square
  }
  
  const premium = PREMIUM_SQUARES.find(square => square.row === row && square.col === col);
  return premium ? premium.type as PremiumSquareType : null;
}

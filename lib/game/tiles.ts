import { TILE_DISTRIBUTION, LETTER_POINTS, MAX_TILES_IN_RACK } from "./constants";

/**
 * Create a full bag of tiles based on standard Scrabble distribution
 */
export function createTileBag(): string[] {
  const tiles: string[] = [];
  
  for (const [letter, count] of Object.entries(TILE_DISTRIBUTION)) {
    for (let i = 0; i < count; i++) {
      tiles.push(letter);
    }
  }
  
  return shuffleArray(tiles);
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Draw tiles from the bag to fill a player's rack
 */
export function drawTiles(bag: string[], currentTiles: string[], targetCount: number = MAX_TILES_IN_RACK): {
  newTiles: string[];
  remainingBag: string[];
  drawnTiles: string[];
} {
  const tilesToDraw = Math.min(targetCount - currentTiles.length, bag.length);
  
  if (tilesToDraw <= 0) {
    return {
      newTiles: [...currentTiles],
      remainingBag: [...bag],
      drawnTiles: []
    };
  }
  
  const drawnTiles = bag.slice(0, tilesToDraw);
  const remainingBag = bag.slice(tilesToDraw);
  const newTiles = [...currentTiles, ...drawnTiles];
  
  return {
    newTiles,
    remainingBag,
    drawnTiles
  };
}

/**
 * Exchange tiles from player's rack with tiles from the bag
 */
export function exchangeTiles(
  playerTiles: string[], 
  tilesToExchange: string[], 
  bag: string[]
): {
  newTiles: string[];
  newBag: string[];
  success: boolean;
  error?: string;
} {
  // Validate that player has the tiles to exchange
  const playerTilesCopy = [...playerTiles];
  for (const tile of tilesToExchange) {
    const index = playerTilesCopy.indexOf(tile);
    if (index === -1) {
      return {
        newTiles: playerTiles,
        newBag: bag,
        success: false,
        error: `Player doesn't have tile: ${tile}`
      };
    }
    playerTilesCopy.splice(index, 1);
  }
  
  // Check if bag has enough tiles
  if (bag.length < tilesToExchange.length) {
    return {
      newTiles: playerTiles,
      newBag: bag,
      success: false,
      error: "Not enough tiles in bag for exchange"
    };
  }
  
  // Perform exchange
  const newBag = [...bag.slice(tilesToExchange.length), ...tilesToExchange];
  const shuffledBag = shuffleArray(newBag);
  
  const drawResult = drawTiles(shuffledBag, playerTilesCopy, MAX_TILES_IN_RACK);
  
  return {
    newTiles: drawResult.newTiles,
    newBag: drawResult.remainingBag,
    success: true
  };
}

/**
 * Remove specific tiles from player's rack
 */
export function removeTilesFromRack(playerTiles: string[], tilesToRemove: string[]): {
  newTiles: string[];
  success: boolean;
  error?: string;
} {
  const playerTilesCopy = [...playerTiles];
  
  for (const tile of tilesToRemove) {
    const index = playerTilesCopy.indexOf(tile);
    if (index === -1) {
      return {
        newTiles: playerTiles,
        success: false,
        error: `Player doesn't have tile: ${tile}`
      };
    }
    playerTilesCopy.splice(index, 1);
  }
  
  return {
    newTiles: playerTilesCopy,
    success: true
  };
}

/**
 * Get the point value for a letter
 */
export function getLetterPoints(letter: string): number {
  return LETTER_POINTS[letter as keyof typeof LETTER_POINTS] || 0;
}

/**
 * Create a tile object with letter and points
 */
export function createTile(letter: string, isBlank: boolean = false): {
  letter: string;
  points: number;
  isBlank?: boolean;
} {
  return {
    letter: letter.toUpperCase(),
    points: isBlank ? 0 : getLetterPoints(letter),
    isBlank: isBlank || undefined
  };
}

/**
 * Check if a tile is a blank tile
 */
export function isBlankTile(tile: { letter: string; points: number; isBlank?: boolean }): boolean {
  return tile.isBlank === true || tile.points === 0;
}

/**
 * Validate that a player has the required tiles to make a move
 */
export function validatePlayerHasTiles(
  playerTiles: string[], 
  requiredTiles: string[]
): { valid: boolean; error?: string } {
  const availableTiles = [...playerTiles];
  
  for (const requiredTile of requiredTiles) {
    const index = availableTiles.indexOf(requiredTile);
    if (index === -1) {
      // Check if it could be a blank tile
      const blankIndex = availableTiles.indexOf('BLANK');
      if (blankIndex === -1) {
        return {
          valid: false,
          error: `Player doesn't have required tile: ${requiredTile}`
        };
      }
      // Use blank tile
      availableTiles.splice(blankIndex, 1);
    } else {
      availableTiles.splice(index, 1);
    }
  }
  
  return { valid: true };
}

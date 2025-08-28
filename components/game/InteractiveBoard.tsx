import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { BoardCell as BoardCellType } from '../../database/drizzle/schema/games';
import { BOARD_SIZE, getPremiumSquareType } from '../../lib/game/constants';
import { cn } from '../../lib/utils';

interface DraggedTile {
  letter: string;
  points: number;
  sourceIndex: number; // index in tile rack
}

interface PlacedTile {
  letter: string;
  points: number;
  row: number;
  col: number;
  sourceIndex: number;
  isTemporary: boolean; // true if not yet submitted
}

export type { PlacedTile };

interface InteractiveBoardProps {
  board: BoardCellType[][];
  onTilePlacement?: (tiles: PlacedTile[]) => void;
  onTileReturn?: (tileIndex: number) => void;
  className?: string;
}

export interface InteractiveBoardHandle {
  handleExternalDragStart: (tile: DraggedTile) => void;
  handleExternalDragEnd: () => void;
  clearTemporaryTiles: () => void;
  getPlacedTiles: () => PlacedTile[];
}

export const InteractiveBoard = forwardRef<InteractiveBoardHandle, InteractiveBoardProps>(({ 
  board, 
  onTilePlacement, 
  onTileReturn,
  className 
}, ref) => {
  const [draggedTile, setDraggedTile] = useState<DraggedTile | null>(null);
  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>([]);
  const [hoveredCell, setHoveredCell] = useState<{row: number, col: number} | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent, row: number, col: number) => {
    if (draggedTile && canPlaceTile(row, col)) {
      e.preventDefault();
      setHoveredCell({ row, col });
    }
  }, [draggedTile]);

  const handleDragLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    setHoveredCell(null);
    
    if (draggedTile && canPlaceTile(row, col)) {
      const newPlacedTile: PlacedTile = {
        letter: draggedTile.letter,
        points: draggedTile.points,
        row,
        col,
        sourceIndex: draggedTile.sourceIndex,
        isTemporary: true,
      };
      
      const updatedPlacedTiles = [...placedTiles, newPlacedTile];
      setPlacedTiles(updatedPlacedTiles);
      onTilePlacement?.(updatedPlacedTiles);
      setDraggedTile(null);
    }
  }, [draggedTile, placedTiles, onTilePlacement]);

  const canPlaceTile = (row: number, col: number): boolean => {
    // Check if cell is already occupied
    if (board[row][col].tile) return false;
    
    // Check if any temporary tiles are already placed here
    if (placedTiles.some(tile => tile.row === row && tile.col === col)) return false;
    
    return true;
  };

  const handleTileDoubleClick = (tile: PlacedTile) => {
    // Return tile to rack
    const updatedPlacedTiles = placedTiles.filter(
      t => !(t.row === tile.row && t.col === tile.col)
    );
    setPlacedTiles(updatedPlacedTiles);
    onTileReturn?.(tile.sourceIndex);
    onTilePlacement?.(updatedPlacedTiles);
  };

  const getCellContent = (row: number, col: number) => {
    // Check for temporarily placed tiles
    const placedTile = placedTiles.find(t => t.row === row && t.col === col);
    if (placedTile) {
      return {
        letter: placedTile.letter,
        points: placedTile.points,
        isTemporary: true,
      };
    }
    
    // Check for permanent tiles from board state
    if (board[row][col].tile) {
      return {
        letter: board[row][col].tile!.letter,
        points: board[row][col].tile!.points,
        isTemporary: false,
      };
    }
    
    return null;
  };

  // Custom drag event handlers to be called from parent (TileRack)
  const handleExternalDragStart = (tile: DraggedTile) => {
    setDraggedTile(tile);
  };

  const handleExternalDragEnd = () => {
    setDraggedTile(null);
    setHoveredCell(null);
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleExternalDragStart,
    handleExternalDragEnd,
    clearTemporaryTiles: () => {
      setPlacedTiles([]);
    },
    getPlacedTiles: () => placedTiles,
  }));

  return (
    <div 
      className={cn(
        "grid grid-cols-15 gap-0 bg-gray-800 p-2 rounded-lg",
        "w-full max-w-2xl mx-auto aspect-square",
        className
      )}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const cellContent = getCellContent(rowIndex, colIndex);
          const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;
          const canDrop = draggedTile ? canPlaceTile(rowIndex, colIndex) : false;
          
          return (
            <InteractiveBoardCell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              premium={cell.premium}
              tile={cellContent}
              isHovered={isHovered}
              canDrop={canDrop}
              board={board}
              placedTiles={placedTiles}
              onDragOver={(e: React.DragEvent) => handleDragOver(e, rowIndex, colIndex)}
              onDragLeave={handleDragLeave}
              onDrop={(e: React.DragEvent) => handleDrop(e, rowIndex, colIndex)}
              onTileDoubleClick={cellContent?.isTemporary ? 
                () => handleTileDoubleClick(placedTiles.find(t => t.row === rowIndex && t.col === colIndex)!) 
                : undefined
              }
            />
          );
        })
      )}
    </div>
  );
});

InteractiveBoard.displayName = 'InteractiveBoard';

interface InteractiveBoardCellProps {
  row: number;
  col: number;
  premium?: 'DL' | 'TL' | 'DW' | 'TW' | 'STAR';
  tile?: {
    letter: string;
    points: number;
    isTemporary: boolean;
  } | null;
  isHovered: boolean;
  canDrop: boolean;
  board: BoardCellType[][];
  placedTiles: PlacedTile[];
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onTileDoubleClick?: () => void;
}

function InteractiveBoardCell({ 
  row, 
  col, 
  premium, 
  tile, 
  isHovered, 
  canDrop,
  board,
  placedTiles,
  onDragOver, 
  onDragLeave, 
  onDrop,
  onTileDoubleClick
}: InteractiveBoardCellProps) {
  const getPremiumSquareClass = (premiumType?: string) => {
    switch (premiumType) {
      case 'TW':
        return 'bg-red-600 text-white';
      case 'DW':
        return 'bg-red-400 text-white';
      case 'TL':
        return 'bg-blue-600 text-white';
      case 'DL':
        return 'bg-blue-400 text-white';
      case 'STAR':
        return 'bg-pink-500 text-white';
      default:
        return 'bg-gray-200 hover:bg-gray-300'; // Changed from green to gray
    }
  };

  const getPremiumLabel = (premiumType?: string) => {
    switch (premiumType) {
      case 'TW': return 'TW';
      case 'DW': return 'DW';
      case 'TL': return 'TL';
      case 'DL': return 'DL';
      case 'STAR': return '★';
      default: return '';
    }
  };

  // Check for adjacent tiles (including both permanent and temporary tiles)
  const hasTileAt = (r: number, c: number) => {
    if (r < 0 || r > 14 || c < 0 || c > 14) return false;
    // Check permanent tiles from board
    if (board[r][c].tile) return true;
    // Check temporary tiles from placedTiles
    return placedTiles.some(pt => pt.row === r && pt.col === c);
  };

  const hasTopTile = hasTileAt(row - 1, col);
  const hasRightTile = hasTileAt(row, col + 1);
  const hasBottomTile = hasTileAt(row + 1, col);
  const hasLeftTile = hasTileAt(row, col - 1);

  // Dynamic border classes based on adjacent tiles
  const getBorderClasses = () => {
    if (!tile) {
      return 'border border-white'; // White borders for empty cells
    }

    let borderClass = 'border-white';
    
    // Remove borders where tiles are adjacent
    if (hasTopTile) borderClass += ' border-t-0';
    if (hasRightTile) borderClass += ' border-r-0';
    if (hasBottomTile) borderClass += ' border-b-0';
    if (hasLeftTile) borderClass += ' border-l-0';
    
    return `border ${borderClass}`;
  };

  const baseClasses = cn(
    "aspect-square text-xs font-bold cursor-pointer transition-all duration-200",
    "flex items-center justify-center relative",
    tile ? 'bg-yellow-200 hover:bg-yellow-300' : getPremiumSquareClass(premium),
    getBorderClasses(),
    isHovered && canDrop && "ring-2 ring-blue-400 ring-opacity-75 scale-105",
    canDrop && "hover:ring-1 hover:ring-blue-300",
    tile?.isTemporary && "ring-2 ring-orange-400 ring-inset shadow-lg"
  );

  return (
    <div
      className={baseClasses}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDoubleClick={onTileDoubleClick}
      title={tile?.isTemporary ? "Double-click to return to rack" : ""}
    >
      {tile ? (
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Letter with subscript score */}
          <span className="text-black font-bold text-lg leading-none">
            {tile.letter}
            <sub className="text-xs font-medium ml-0.5">{tile.points}</sub>
          </span>
        </div>
      ) : (
        <span className="text-xs font-medium">
          {getPremiumLabel(premium)}
        </span>
      )}
    </div>
  );
}

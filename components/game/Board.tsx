import React from 'react';
import { BoardCell as BoardCellType } from '../../database/drizzle/schema/games';
import { BOARD_SIZE } from '../../lib/game/constants';
import { cn } from '../../lib/utils';

interface BoardProps {
  board: BoardCellType[][];
  onCellClick?: (row: number, col: number) => void;
  className?: string;
}

export function Board({ board, onCellClick, className }: BoardProps) {
  return (
    <div className={cn(
      "grid grid-cols-15 gap-0 bg-gray-800 p-2 rounded-lg",
      "w-full max-w-2xl mx-auto aspect-square",
      className
    )}>
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <BoardCellComponent
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            row={rowIndex}
            col={colIndex}
            board={board}
            onClick={() => onCellClick?.(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
}

interface BoardCellProps {
  cell: BoardCellType;
  row: number;
  col: number;
  board: BoardCellType[][];
  onClick?: () => void;
}

function BoardCellComponent({ cell, row, col, board, onClick }: BoardCellProps) {
  const getPremiumSquareClass = (premium?: string) => {
    switch (premium) {
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

  const getPremiumSquareText = (premium?: string) => {
    switch (premium) {
      case 'TW':
        return 'TW';
      case 'DW':
        return 'DW';
      case 'TL':
        return 'TL';
      case 'DL':
        return 'DL';
      case 'STAR':
        return '★';
      default:
        return '';
    }
  };

  // Check for adjacent tiles to merge borders
  const hasTopTile = row > 0 && board[row - 1][col].tile;
  const hasRightTile = col < 14 && board[row][col + 1].tile;
  const hasBottomTile = row < 14 && board[row + 1][col].tile;
  const hasLeftTile = col > 0 && board[row][col - 1].tile;

  // Dynamic border classes based on adjacent tiles
  const getBorderClasses = () => {
    if (!cell.tile) {
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

  return (
    <button
      className={cn(
        "relative w-full aspect-square text-xs font-bold",
        "flex items-center justify-center transition-colors duration-200",
        cell.tile ? 'bg-yellow-200 hover:bg-yellow-300' : getPremiumSquareClass(cell.premium),
        cell.isNew && 'ring-2 ring-orange-400 ring-inset',
        getBorderClasses(),
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
      disabled={!onClick}
    >
      {cell.tile ? (
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Letter with subscript score */}
          <span className="text-black font-bold text-lg leading-none">
            {cell.tile.letter}
            <sub className="text-xs font-medium ml-0.5">{cell.tile.points}</sub>
          </span>
        </div>
      ) : (
        <span className="text-xs font-medium">
          {getPremiumSquareText(cell.premium)}
        </span>
      )}
    </button>
  );
}

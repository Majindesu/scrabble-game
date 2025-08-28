import React from 'react';
import { getLetterPoints } from '../../lib/game/tiles';
import { cn } from '../../lib/utils';

interface TileRackProps {
  tiles: string[];
  onTileClick?: (tile: string, index: number) => void;
  selectedTiles?: number[];
  className?: string;
}

export function TileRack({ tiles, onTileClick, selectedTiles = [], className }: TileRackProps) {
  return (
    <div className={cn(
      "flex gap-2 justify-center items-center p-4 bg-gray-100 rounded-lg",
      "min-h-[80px] border-2 border-gray-300",
      className
    )}>
      {tiles.map((tile, index) => (
        <Tile
          key={index}
          letter={tile}
          points={getLetterPoints(tile)}
          onClick={() => onTileClick?.(tile, index)}
          isSelected={selectedTiles.includes(index)}
        />
      ))}
      
      {/* Show empty slots */}
      {Array.from({ length: 7 - tiles.length }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className="w-12 h-12 border-2 border-dashed border-gray-400 rounded bg-gray-50"
        />
      ))}
    </div>
  );
}

interface TileProps {
  letter: string;
  points: number;
  onClick?: () => void;
  isSelected?: boolean;
  isBlank?: boolean;
  className?: string;
}

export function Tile({ 
  letter, 
  points, 
  onClick, 
  isSelected = false, 
  isBlank = false,
  className 
}: TileProps) {
  return (
    <button
      className={cn(
        "w-12 h-12 bg-yellow-100 border-2 border-yellow-600 rounded shadow-md",
        "flex flex-col items-center justify-center font-bold transition-all duration-200",
        "hover:bg-yellow-200 hover:shadow-lg active:scale-95",
        isSelected && "ring-2 ring-blue-400 bg-blue-100 border-blue-600",
        isBlank && "bg-gray-200 border-gray-500",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      disabled={!onClick}
    >
      <span className="text-lg font-black leading-none text-gray-900">
        {letter === 'BLANK' ? '?' : letter}
      </span>
      <span className="text-xs leading-none text-gray-700">
        {points}
      </span>
    </button>
  );
}

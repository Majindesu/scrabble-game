import React, { useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import { LETTER_POINTS } from '../../lib/game/constants';
import type { InteractiveBoardHandle } from './InteractiveBoard';

interface TileInfo {
  letter: string;
  points: number;
  isBlank?: boolean;
}

interface InteractiveTileRackProps {
  tiles: string[];
  boardRef?: React.RefObject<InteractiveBoardHandle | null>;
  onTileUsed?: (tileIndex: number) => void;
  onTileReturned?: (tileIndex: number) => void;
  className?: string;
}

export function InteractiveTileRack({ 
  tiles, 
  boardRef,
  onTileUsed, 
  onTileReturned,
  className 
}: InteractiveTileRackProps) {
  const [availableTiles, setAvailableTiles] = useState<(TileInfo | null)[]>(
    tiles.map(letter => letter ? ({ 
      letter, 
      points: LETTER_POINTS[letter as keyof typeof LETTER_POINTS] || 0,
      isBlank: letter === '_'
    }) : null)
  );
  
  const [draggedTileIndex, setDraggedTileIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, tile: TileInfo, index: number) => {
    setDraggedTileIndex(index);
    
    // Pass drag info to the board
    if (boardRef?.current) {
      boardRef.current.handleExternalDragStart({
        letter: tile.letter,
        points: tile.points,
        sourceIndex: index
      });
    }

    // Set drag data
    e.dataTransfer.setData('text/plain', JSON.stringify({
      letter: tile.letter,
      points: tile.points,
      sourceIndex: index
    }));

    // Visual feedback
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTileIndex(null);
    
    // Notify board that drag ended
    if (boardRef?.current) {
      boardRef.current.handleExternalDragEnd();
    }

    // If the tile wasn't dropped successfully, it stays in the rack
    // The board will handle tile placement/removal
  };

  const removeTile = (index: number) => {
    const newTiles = [...availableTiles];
    newTiles[index] = null;
    setAvailableTiles(newTiles);
    onTileUsed?.(index);
  };

  const returnTile = (index: number, tile: TileInfo) => {
    const newTiles = [...availableTiles];
    newTiles[index] = tile;
    setAvailableTiles(newTiles);
    onTileReturned?.(index);
  };

  // Remove the imperative handle - this was incorrectly trying to implement board methods

  const handleShuffle = () => {
    // Shuffle available tiles (non-null ones)
    const shuffledTiles = [...availableTiles];
    const availableIndices = shuffledTiles
      .map((tile, index) => tile ? index : -1)
      .filter(index => index !== -1);
    
    // Fisher-Yates shuffle for available tiles
    for (let i = availableIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const indexA = availableIndices[i];
      const indexB = availableIndices[j];
      [shuffledTiles[indexA], shuffledTiles[indexB]] = [shuffledTiles[indexB], shuffledTiles[indexA]];
    }
    
    setAvailableTiles(shuffledTiles);
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Tile Rack */}
      <div className="bg-amber-800 rounded-lg p-3 shadow-lg">
        <div className="flex space-x-2">
          {availableTiles.map((tile, index) => (
            <TileSlot
              key={index}
              tile={tile}
              index={index}
              isDragging={draggedTileIndex === index}
              onDragStart={(e) => tile && handleDragStart(e, tile, index)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex space-x-2">
        <button
          onClick={handleShuffle}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          🔀 Shuffle
        </button>
        <button
          onClick={() => boardRef?.current?.clearTemporaryTiles()}
          className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
        >
          ↩️ Recall All
        </button>
      </div>
    </div>
  );
}

interface TileSlotProps {
  tile: TileInfo | null;
  index: number;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

function TileSlot({ tile, index, isDragging, onDragStart, onDragEnd }: TileSlotProps) {
  return (
    <div
      className={cn(
        "w-12 h-12 border-2 border-amber-600 rounded bg-amber-100 flex items-center justify-center",
        "transition-all duration-200",
        tile && "cursor-grab active:cursor-grabbing hover:bg-amber-200",
        isDragging && "opacity-50 scale-95"
      )}
    >
      {tile ? (
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className={cn(
            "w-full h-full flex flex-col items-center justify-center",
            "bg-yellow-100 border border-gray-300 rounded text-black font-bold",
            "hover:bg-yellow-200 transition-colors"
          )}
        >
          <span className="text-lg leading-none">{tile.letter === '_' ? '🔲' : tile.letter}</span>
          <span className="text-xs leading-none">{tile.points}</span>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-amber-500 text-xs">
          Empty
        </div>
      )}
    </div>
  );
}

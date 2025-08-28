import React from 'react';
import { cn } from '../../lib/utils';

interface GameControlsProps {
  onSubmitMove?: () => void;
  onPassTurn?: () => void;
  onExchangeTiles?: () => void;
  onRecallTiles?: () => void;
  onShuffleTiles?: () => void;
  canSubmit?: boolean;
  isExchangeMode?: boolean;
  selectedTilesCount?: number;
  className?: string;
}

export function GameControls({
  onSubmitMove,
  onPassTurn,
  onExchangeTiles,
  onRecallTiles,
  onShuffleTiles,
  canSubmit = false,
  isExchangeMode = false,
  selectedTilesCount = 0,
  className
}: GameControlsProps) {
  return (
    <div className={cn("flex flex-col space-y-3 p-4 bg-white rounded-lg shadow", className)}>
      <h3 className="text-lg font-semibold text-gray-800">Game Controls</h3>
      
      {/* Primary Actions */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={onSubmitMove}
          disabled={!canSubmit}
          className={cn(
            "px-4 py-2 rounded font-medium transition-all",
            canSubmit
              ? "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          ✓ Submit Move
        </button>
        
        <button
          onClick={onPassTurn}
          disabled={isExchangeMode}
          className={cn(
            "px-4 py-2 rounded font-medium transition-all",
            !isExchangeMode
              ? "bg-yellow-600 text-white hover:bg-yellow-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          ⏭️ Pass Turn
        </button>
      </div>
      
      {/* Secondary Actions */}
      <div className="border-t pt-3 space-y-2">
        {!isExchangeMode ? (
          <button
            onClick={onExchangeTiles}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-all"
          >
            🔄 Exchange Tiles
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Selected: {selectedTilesCount} tiles
            </p>
            <button
              onClick={onExchangeTiles}
              disabled={selectedTilesCount === 0}
              className={cn(
                "w-full px-4 py-2 rounded font-medium transition-all",
                selectedTilesCount > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              ✓ Confirm Exchange
            </button>
          </div>
        )}
        
        <button
          onClick={onRecallTiles}
          className="w-full px-4 py-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 transition-all"
        >
          ↩️ Recall All Tiles
        </button>
        
        <button
          onClick={onShuffleTiles}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded font-medium hover:bg-purple-700 transition-all"
        >
          🔀 Shuffle Rack
        </button>
      </div>
      
      {/* Move Instructions */}
      <div className="border-t pt-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Instructions:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Drag tiles from rack to board</li>
          <li>• Double-click placed tiles to return</li>
          <li>• All new tiles must connect</li>
          <li>• Form valid words to score</li>
        </ul>
      </div>
    </div>
  );
}

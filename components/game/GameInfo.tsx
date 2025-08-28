import React from 'react';
import { cn } from '../../lib/utils';

interface GameInfoProps {
  currentPlayer?: string;
  turnNumber?: number;
  tilesRemaining?: number;
  gameStatus: 'waiting' | 'active' | 'finished' | 'paused';
  className?: string;
}

export function GameInfo({ 
  currentPlayer, 
  turnNumber = 0, 
  tilesRemaining = 0, 
  gameStatus,
  className 
}: GameInfoProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'waiting':
        return { text: 'Waiting for players', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
      case 'active':
        return { text: 'Game in progress', color: 'text-green-600 bg-green-50 border-green-200' };
      case 'finished':
        return { text: 'Game finished', color: 'text-gray-600 bg-gray-50 border-gray-200' };
      case 'paused':
        return { text: 'Game paused', color: 'text-orange-600 bg-orange-50 border-orange-200' };
      default:
        return { text: 'Unknown status', color: 'text-gray-600 bg-gray-50 border-gray-200' };
    }
  };

  const statusInfo = getStatusInfo(gameStatus);

  return (
    <div className={cn("bg-white rounded-lg shadow-md p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">Game Info</h3>
        <div className={cn("px-3 py-1 rounded-full border text-sm font-medium", statusInfo.color)}>
          {statusInfo.text}
        </div>
      </div>
      
      {gameStatus === 'active' && (
        <div className="space-y-3">
          {currentPlayer && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Turn</span>
              <span className="font-semibold text-blue-600">{currentPlayer}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Turn</span>
            <span className="font-medium">{turnNumber}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tiles Remaining</span>
            <span className="font-medium">{tilesRemaining}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface GameControlsProps {
  onSubmitMove?: () => void;
  onPassTurn?: () => void;
  onExchangeTiles?: () => void;
  onRecallTiles?: () => void;
  onShuffleRack?: () => void;
  canSubmitMove?: boolean;
  canPassTurn?: boolean;
  canExchangeTiles?: boolean;
  isPlayerTurn?: boolean;
  className?: string;
}

export function GameControls({
  onSubmitMove,
  onPassTurn,
  onExchangeTiles,
  onRecallTiles,
  onShuffleRack,
  canSubmitMove = false,
  canPassTurn = true,
  canExchangeTiles = true,
  isPlayerTurn = true,
  className
}: GameControlsProps) {
  if (!isPlayerTurn) {
    return (
      <div className={cn("bg-gray-100 rounded-lg p-4 text-center", className)}>
        <p className="text-gray-600">Waiting for other player's turn...</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg shadow-md p-4", className)}>
      <h3 className="text-lg font-bold mb-4 text-gray-800">Game Controls</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onSubmitMove}
          disabled={!canSubmitMove}
          className={cn(
            "px-4 py-2 rounded-md font-medium transition-colors",
            canSubmitMove
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          )}
        >
          Submit Move
        </button>
        
        <button
          onClick={onPassTurn}
          disabled={!canPassTurn}
          className={cn(
            "px-4 py-2 rounded-md font-medium transition-colors",
            canPassTurn
              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          )}
        >
          Pass Turn
        </button>
        
        <button
          onClick={onExchangeTiles}
          disabled={!canExchangeTiles}
          className={cn(
            "px-4 py-2 rounded-md font-medium transition-colors",
            canExchangeTiles
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          )}
        >
          Exchange Tiles
        </button>
        
        <button
          onClick={onRecallTiles}
          className="px-4 py-2 rounded-md font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors"
        >
          Recall Tiles
        </button>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={onShuffleRack}
          className="w-full px-4 py-2 rounded-md font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors"
        >
          Shuffle Rack
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { cn } from '../../lib/utils';

interface TurnIndicatorProps {
  currentPlayer: string;
  turnNumber?: number;
  timeRemaining?: number; // seconds, optional timer
  isWaitingForMove?: boolean;
  className?: string;
}

export function TurnIndicator({
  currentPlayer,
  turnNumber = 1,
  timeRemaining,
  isWaitingForMove = false,
  className
}: TurnIndicatorProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg shadow transition-all",
      isWaitingForMove ? "bg-yellow-100 border-l-4 border-yellow-500" : "bg-blue-100 border-l-4 border-blue-500",
      className
    )}>
      <div className="flex items-center space-x-3">
        <div className={cn(
          "w-3 h-3 rounded-full animate-pulse",
          isWaitingForMove ? "bg-yellow-500" : "bg-blue-500"
        )} />
        
        <div>
          <h3 className="font-semibold text-gray-800">
            {isWaitingForMove ? 'Waiting for move...' : `${currentPlayer}'s Turn`}
          </h3>
          <p className="text-sm text-gray-600">
            Turn {turnNumber}
          </p>
        </div>
      </div>
      
      {timeRemaining !== undefined && (
        <div className={cn(
          "flex flex-col items-end",
          timeRemaining <= 30 && "text-red-600"
        )}>
          <span className="text-lg font-mono font-bold">
            {formatTime(timeRemaining)}
          </span>
          <span className="text-xs text-gray-500">
            Time left
          </span>
        </div>
      )}
    </div>
  );
}

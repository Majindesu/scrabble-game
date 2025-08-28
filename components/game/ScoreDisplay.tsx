import React from 'react';
import { cn } from '../../lib/utils';

interface ScoreDisplayProps {
  players: Array<{
    id: number;
    name: string;
    score: number;
    isCurrentTurn?: boolean;
  }>;
  className?: string;
}

export function ScoreDisplay({ players, className }: ScoreDisplayProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-md p-4", className)}>
      <h3 className="text-lg font-bold mb-4 text-gray-800">Scores</h3>
      
      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              "flex justify-between items-center p-3 rounded-md transition-colors",
              player.isCurrentTurn 
                ? "bg-blue-100 border-2 border-blue-300" 
                : "bg-gray-50 hover:bg-gray-100"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                player.isCurrentTurn ? "bg-blue-500" : "bg-gray-300"
              )} />
              <span className={cn(
                "font-medium",
                player.isCurrentTurn ? "text-blue-900" : "text-gray-700"
              )}>
                {player.name}
              </span>
            </div>
            
            <span className={cn(
              "text-xl font-bold tabular-nums",
              player.isCurrentTurn ? "text-blue-900" : "text-gray-900"
            )}>
              {player.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CurrentMoveScoreProps {
  score: number;
  wordsFormed?: Array<{ word: string; score: number }>;
  usedAllTiles?: boolean;
  bonusPoints?: number;
  className?: string;
}

export function CurrentMoveScore({ 
  score, 
  wordsFormed = [], 
  usedAllTiles = false,
  bonusPoints = 0,
  className 
}: CurrentMoveScoreProps) {
  if (score === 0 && wordsFormed.length === 0) return null;

  return (
    <div className={cn(
      "bg-green-50 border border-green-200 rounded-lg p-4",
      className
    )}>
      <h4 className="font-semibold text-green-800 mb-2">Current Move</h4>
      
      {wordsFormed.length > 0 && (
        <div className="space-y-1 mb-2">
          {wordsFormed.map((word, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="font-medium text-green-700">{word.word}</span>
              <span className="text-green-800">{word.score} pts</span>
            </div>
          ))}
        </div>
      )}
      
      {usedAllTiles && (
        <div className="flex justify-between text-sm text-orange-700 mb-1">
          <span>Bonus (all tiles used)</span>
          <span>+50 pts</span>
        </div>
      )}
      
      {bonusPoints > 0 && (
        <div className="flex justify-between text-sm text-purple-700 mb-1">
          <span>Bonus</span>
          <span>+{bonusPoints} pts</span>
        </div>
      )}
      
      <div className="border-t border-green-300 pt-2 mt-2">
        <div className="flex justify-between font-bold text-green-900">
          <span>Total</span>
          <span>{score} pts</span>
        </div>
      </div>
    </div>
  );
}

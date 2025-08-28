import React from 'react';
import { cn } from '../../lib/utils';

export interface MoveError {
  type: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
}

interface MoveValidationProps {
  errors: MoveError[];
  currentMoveScore?: number;
  previewWords?: Array<{
    word: string;
    points: number;
    isValid: boolean;
  }>;
  className?: string;
}

export function MoveValidation({
  errors,
  currentMoveScore = 0,
  previewWords = [],
  className
}: MoveValidationProps) {
  if (errors.length === 0 && previewWords.length === 0 && currentMoveScore === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Move Preview */}
      {previewWords.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Move Preview</h4>
          <div className="space-y-1">
            {previewWords.map((wordInfo, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className={cn(
                  "font-mono",
                  wordInfo.isValid ? "text-blue-700" : "text-red-600"
                )}>
                  {wordInfo.word}
                  {!wordInfo.isValid && " ❌"}
                </span>
                <span className="text-blue-600 font-medium">
                  {wordInfo.points} pts
                </span>
              </div>
            ))}
            {currentMoveScore > 0 && (
              <div className="border-t pt-2 mt-2 flex justify-between items-center font-semibold">
                <span className="text-blue-800">Total Score:</span>
                <span className="text-blue-800 text-lg">
                  +{currentMoveScore}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Errors and Warnings */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className={cn(
                "rounded-lg p-3 border-l-4",
                error.type === 'error' && "bg-red-50 border-red-500",
                error.type === 'warning' && "bg-yellow-50 border-yellow-500",
                error.type === 'info' && "bg-blue-50 border-blue-500"
              )}
            >
              <div className="flex items-start space-x-2">
                <span className="text-lg">
                  {error.type === 'error' && '❌'}
                  {error.type === 'warning' && '⚠️'}
                  {error.type === 'info' && 'ℹ️'}
                </span>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    error.type === 'error' && "text-red-800",
                    error.type === 'warning' && "text-yellow-800",
                    error.type === 'info' && "text-blue-800"
                  )}>
                    {error.message}
                  </p>
                  {error.details && (
                    <p className={cn(
                      "text-xs mt-1",
                      error.type === 'error' && "text-red-600",
                      error.type === 'warning' && "text-yellow-600",
                      error.type === 'info' && "text-blue-600"
                    )}>
                      {error.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Success state when no errors */}
      {errors.length === 0 && previewWords.length > 0 && previewWords.every(w => w.isValid) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">✅</span>
            <p className="text-sm font-medium text-green-800">
              Valid move! Ready to submit.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

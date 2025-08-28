import React, { useState, useRef, useCallback, useEffect } from 'react';
import { InteractiveBoard, InteractiveBoardHandle } from '../../components/game/InteractiveBoard';
import { InteractiveTileRack } from '../../components/game/InteractiveTileRack';
import { GameControls } from '../../components/game/GameControls';
import { TurnIndicator } from '../../components/game/TurnIndicator';
import { ScoreDisplay } from '../../components/game/ScoreDisplay';
import { GameInfo } from '../../components/game/GameInfo';
import { MoveValidation, MoveError } from '../../components/game/MoveValidation';
import type { Data } from "../interactive-game/+data";
import { useData } from "vike-react/useData";

interface PlacedTile {
  letter: string;
  points: number;
  row: number;
  col: number;
  sourceIndex: number;
  isTemporary: boolean;
}

export default function InteractiveGamePage() {
  const data = useData<Data>();
  const { game } = data;
  
  const boardRef = useRef<InteractiveBoardHandle>(null);
  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>([]);
  const [moveErrors, setMoveErrors] = useState<MoveError[]>([]);
  const [currentMoveScore, setCurrentMoveScore] = useState(0);
  const [isExchangeMode, setIsExchangeMode] = useState(false);
  const [selectedTilesForExchange, setSelectedTilesForExchange] = useState<number[]>([]);

  // Real-time move validation
  useEffect(() => {
    validateCurrentMove();
  }, [placedTiles]);

  const validateCurrentMove = useCallback(() => {
    const errors: MoveError[] = [];
    
    if (placedTiles.length === 0) {
      setMoveErrors([]);
      setCurrentMoveScore(0);
      return;
    }

    // Basic validation rules
    if (placedTiles.length === 1) {
      errors.push({
        type: 'warning',
        message: 'Single tile moves are rarely valid',
        details: 'Make sure this tile forms a word with existing tiles'
      });
    }

    // Check if tiles are in a line (row or column)
    const rows = [...new Set(placedTiles.map(t => t.row))];
    const cols = [...new Set(placedTiles.map(t => t.col))];
    
    if (rows.length > 1 && cols.length > 1) {
      errors.push({
        type: 'error',
        message: 'Tiles must be placed in a single row or column',
        details: 'All tiles in one move must form a straight line'
      });
    }

    // Check for gaps (simplified)
    if (rows.length === 1 && cols.length > 1) {
      const sortedCols = cols.sort((a, b) => a - b);
      for (let i = 1; i < sortedCols.length; i++) {
        if (sortedCols[i] - sortedCols[i-1] > 1) {
          // Check if there's an existing tile filling the gap
          const row = rows[0];
          let hasGap = false;
          for (let col = sortedCols[i-1] + 1; col < sortedCols[i]; col++) {
            if (!game.board[row][col].tile) {
              hasGap = true;
              break;
            }
          }
          if (hasGap) {
            errors.push({
              type: 'error',
              message: 'Tiles cannot have gaps between them',
              details: 'All tiles must be adjacent or have existing tiles between them'
            });
          }
        }
      }
    }

    // Similar check for rows
    if (cols.length === 1 && rows.length > 1) {
      const sortedRows = rows.sort((a, b) => a - b);
      for (let i = 1; i < sortedRows.length; i++) {
        if (sortedRows[i] - sortedRows[i-1] > 1) {
          const col = cols[0];
          let hasGap = false;
          for (let row = sortedRows[i-1] + 1; row < sortedRows[i]; row++) {
            if (!game.board[row][col].tile) {
              hasGap = true;
              break;
            }
          }
          if (hasGap) {
            errors.push({
              type: 'error',
              message: 'Tiles cannot have gaps between them',
              details: 'All tiles must be adjacent or have existing tiles between them'
            });
          }
        }
      }
    }

    // Calculate basic score (simplified)
    let score = placedTiles.reduce((sum, tile) => sum + tile.points, 0);
    
    // Bonus for using all 7 tiles
    if (placedTiles.length === 7) {
      score += 50;
      errors.push({
        type: 'info',
        message: 'Bingo bonus!',
        details: '+50 points for using all 7 tiles'
      });
    }

    setMoveErrors(errors);
    setCurrentMoveScore(score);
  }, [placedTiles, game.board]);

  const handleTilePlacement = useCallback((tiles: PlacedTile[]) => {
    setPlacedTiles(tiles);
  }, []);

  const handleTileReturn = useCallback((tileIndex: number) => {
    // Tile returned to rack - this is handled by the components
    console.log(`Tile ${tileIndex} returned to rack`);
  }, []);

  const handleSubmitMove = useCallback(() => {
    const hasErrors = moveErrors.some(error => error.type === 'error');
    
    if (hasErrors) {
      alert('Please fix all errors before submitting your move.');
      return;
    }

    if (placedTiles.length === 0) {
      alert('Place some tiles before submitting!');
      return;
    }

    // Here we would make a tRPC call to submit the move
    console.log('Submitting move:', placedTiles);
    console.log('Move score:', currentMoveScore);
    
    // For demo purposes, just show an alert
    alert(`Move submitted! Score: ${currentMoveScore} points`);
    
    // Clear temporary tiles
    boardRef.current?.clearTemporaryTiles();
    setPlacedTiles([]);
  }, [placedTiles, currentMoveScore, moveErrors]);

  const handlePassTurn = useCallback(() => {
    if (placedTiles.length > 0) {
      const confirm = window.confirm('You have placed tiles. Are you sure you want to pass your turn?');
      if (!confirm) return;
    }
    
    console.log('Passing turn...');
    boardRef.current?.clearTemporaryTiles();
    setPlacedTiles([]);
    alert('Turn passed!');
  }, [placedTiles]);

  const handleExchangeTiles = useCallback(() => {
    if (!isExchangeMode) {
      setIsExchangeMode(true);
      return;
    }
    
    if (selectedTilesForExchange.length === 0) {
      alert('Select tiles to exchange first!');
      return;
    }
    
    console.log('Exchanging tiles:', selectedTilesForExchange);
    alert(`Exchanging ${selectedTilesForExchange.length} tiles!`);
    setIsExchangeMode(false);
    setSelectedTilesForExchange([]);
  }, [isExchangeMode, selectedTilesForExchange]);

  const handleRecallTiles = useCallback(() => {
    boardRef.current?.clearTemporaryTiles();
    setPlacedTiles([]);
  }, []);

  const handleShuffleTiles = useCallback(() => {
    // This would be handled by the TileRack component
    console.log('Shuffling tiles...');
  }, []);

  const canSubmitMove = placedTiles.length > 0 && !moveErrors.some(e => e.type === 'error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Interactive Scrabble Game
        </h1>
        
        {/* Turn Indicator */}
        <div className="mb-4">
          <TurnIndicator 
            currentPlayer={game.currentPlayer.name}
            turnNumber={1}
            isWaitingForMove={placedTiles.length > 0}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <InteractiveBoard 
              ref={boardRef}
              board={game.board}
              onTilePlacement={handleTilePlacement}
              onTileReturn={handleTileReturn}
            />
            
            {/* Move Validation */}
            <div className="mt-4">
              <MoveValidation 
                errors={moveErrors}
                currentMoveScore={currentMoveScore}
                previewWords={placedTiles.length > 0 ? [{
                  word: placedTiles.map(t => t.letter).join(''),
                  points: currentMoveScore,
                  isValid: !moveErrors.some(e => e.type === 'error')
                }] : []}
              />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <GameControls 
              onSubmitMove={handleSubmitMove}
              onPassTurn={handlePassTurn}
              onExchangeTiles={handleExchangeTiles}
              onRecallTiles={handleRecallTiles}
              onShuffleTiles={handleShuffleTiles}
              canSubmit={canSubmitMove}
              isExchangeMode={isExchangeMode}
              selectedTilesCount={selectedTilesForExchange.length}
            />
            
            <ScoreDisplay 
              players={game.players}
            />
            
            <GameInfo 
              gameStatus={game.status}
              currentPlayer={game.currentPlayer.name}
              tilesRemaining={game.tilesRemaining}
            />
          </div>
        </div>
        
        {/* Player Tile Rack */}
        <div className="mt-6">
          <InteractiveTileRack 
            tiles={game.currentPlayer.tiles}
            boardRef={boardRef}
            onTileUsed={(index) => console.log(`Tile ${index} used`)}
            onTileReturned={(index) => console.log(`Tile ${index} returned`)}
          />
        </div>
      </div>
    </div>
  );
}

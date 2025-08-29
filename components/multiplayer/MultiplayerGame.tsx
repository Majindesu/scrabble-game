import React, { useEffect, useState, useRef } from 'react';
import { useMultiplayerGame } from '../../lib/hooks/useMultiplayerGame';
import { InteractiveBoard } from '../game/InteractiveBoard';
import { InteractiveTileRack } from '../game/InteractiveTileRack';
import { GameControls } from '../game/GameControls';
import { TurnIndicator } from '../game/TurnIndicator';
import { MoveValidation, type MoveError } from '../game/MoveValidation';
import { ScoreDisplay } from '../game/ScoreDisplay';
import type { BoardCell } from '../../database/drizzle/schema/games';
import type { PlacedTile } from '../game/InteractiveBoard';
import { cn } from '../../lib/utils';
import { Users, Wifi, WifiOff } from 'lucide-react';

export function MultiplayerGame() {
  const {
    game,
    currentPlayer,
    isMyTurn,
    isConnected,
    makeMove,
    passTurn,
    exchangeTiles,
    error
  } = useMultiplayerGame();

  const boardRef = useRef<any>(null);
  const rackRef = useRef<any>(null);

  const [gameBoard, setGameBoard] = useState<BoardCell[][]>([]);
  const [currentMoveErrors, setCurrentMoveErrors] = useState<MoveError[]>([]);
  const [currentMoveScore, setCurrentMoveScore] = useState(0);

  // Check if current user is a spectator
  const isSpectator = game && !game.players.some(p => p.id === currentPlayer?.id);
  const spectators = game?.spectators || [];

  // Redirect to lobby if not in a game
  useEffect(() => {
    if (!game) {
      window.location.href = '/multiplayer';
      return;
    }

    // Convert multiplayer game board to our board format
    if (game.board) {
      setGameBoard(game.board);
    }
  }, [game]);

  // Handle move validation
  const handleValidateMove = (errors: string[], score: number) => {
    const moveErrors: MoveError[] = errors.map(error => ({
      type: 'error' as const,
      message: error
    }));
    setCurrentMoveErrors(moveErrors);
    setCurrentMoveScore(score);
  };

  // Handle submitting a move
  const handleSubmitMove = () => {
    if (!isMyTurn) {
      return;
    }

    const placedTiles = boardRef.current?.getPlacedTiles() || [];
    if (placedTiles.length === 0) {
      return;
    }

    if (currentMoveErrors.length > 0) {
      return;
    }

    // Create the move data
    const move = placedTiles.map((tile: PlacedTile) => ({
      row: tile.row,
      col: tile.col,
      letter: tile.letter,
      points: tile.points
    }));

    // Create new board state
    const newBoard = gameBoard.map((row, rowIndex) => 
      row.map((cell, colIndex) => {
        const placedTile = placedTiles.find((t: PlacedTile) => t.row === rowIndex && t.col === colIndex);
        if (placedTile) {
          return {
            ...cell,
            tile: {
              letter: placedTile.letter,
              points: placedTile.points
            }
          };
        }
        return cell;
      })
    );

    // Submit the move through websocket
    makeMove(move, newBoard);

    // Clear temporary tiles from board
    boardRef.current?.clearTemporaryTiles();
  };

  // Handle passing turn
  const handlePassTurn = () => {
    if (!isMyTurn) {
      return;
    }
    
    // Clear any placed tiles first
    boardRef.current?.clearTemporaryTiles();
    passTurn();
  };

  // Handle exchanging tiles
  const handleExchangeTilesAction = () => {
    // This would trigger a tile selection mode in the UI
    // For now, just pass an empty array as a placeholder
    exchangeTiles([]);
  };

  // Handle recalling tiles
  const handleRecallTiles = () => {
    boardRef.current?.clearTemporaryTiles();
    rackRef.current?.returnTilesToRack();
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading game...</h2>
          <p className="text-gray-600">Please wait while we connect you to the game.</p>
        </div>
      </div>
    );
  }

  const myPlayer = game.players.find(p => p.id === currentPlayer?.id);
  const myTiles = myPlayer?.tiles || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with game info */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Users className="w-8 h-8" />
            Multiplayer Scrabble {isSpectator && <span className="text-lg font-normal text-blue-600">(Spectating)</span>}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-600" />
                  Disconnected
                </>
              )}
            </span>
            <span>Game: #{game.id.slice(-6)}</span>
            <span>{game.players.length}/{game.maxPlayers} Players</span>
            {spectators.length > 0 && (
              <span className="text-blue-600">{spectators.length} Spectator{spectators.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Turn indicator */}
        <div className="mb-4">
          <TurnIndicator 
            currentPlayer={game.players[game.currentPlayerIndex]?.name || 'Unknown'}
            isWaitingForMove={!isMyTurn}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <InteractiveBoard
              ref={boardRef}
              board={gameBoard}
              className="mb-4"
            />
            
            {/* Move validation */}
            <MoveValidation 
              errors={currentMoveErrors}
              currentMoveScore={currentMoveScore}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player scores */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Players
              </h3>
              <div className="space-y-2">
                {game.players.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        player.isConnected ? 'bg-green-400' : 'bg-gray-300'
                      )} />
                      <span className={cn(
                        "font-medium",
                        index === game.currentPlayerIndex && "text-blue-600"
                      )}>
                        {player.name}
                        {player.id === currentPlayer?.id && ' (You)'}
                      </span>
                    </div>
                    <span className="text-sm font-mono">
                      {player.score} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Game controls */}
            {/* Game Controls - Only show for players */}
            {!isSpectator && (
              <GameControls
                onSubmitMove={handleSubmitMove}
                onPassTurn={handlePassTurn}
                onExchangeTiles={handleExchangeTilesAction}
                onRecallTiles={handleRecallTiles}
                canSubmit={isMyTurn && currentMoveErrors.length === 0}
              />
            )}

            {/* Spectator info */}
            {isSpectator && spectators.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Spectators</h3>
                <div className="space-y-1 text-sm">
                  {spectators.map((spectator) => (
                    <div key={spectator.id} className="text-blue-700">
                      {spectator.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tile Rack - Only show for players */}
        {!isSpectator && (
          <div className="mt-6 flex justify-center">
            <InteractiveTileRack
              tiles={myTiles.map(tile => tile.letter)}
              boardRef={boardRef}
            />
          </div>
        )}
      </div>
    </div>
  );
}

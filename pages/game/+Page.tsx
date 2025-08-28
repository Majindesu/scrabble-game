import { Board } from "../../components/game/Board";
import { TileRack } from "../../components/game/TileRack";
import { ScoreDisplay } from "../../components/game/ScoreDisplay";
import { GameInfo } from "../../components/game/GameInfo";
import type { Data } from "./+data";
import { useData } from "vike-react/useData";

export default function Page() {
  const data = useData<Data>();
  if (!data || !data.game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading game...</h1>
          <p className="text-gray-600">Please wait while we set up your Scrabble game.</p>
        </div>
      </div>
    );
  }
  const { game } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Scrabble Game
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <Board 
              board={game.board}
              onCellClick={(row: number, col: number) => {
                console.log(`Clicked cell at ${row},${col}`);
              }}
            />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
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
          <TileRack 
            tiles={game.currentPlayer.tiles}
          />
        </div>
      </div>
    </div>
  );
}

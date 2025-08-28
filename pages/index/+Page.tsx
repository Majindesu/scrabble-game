import { Counter } from "./Counter.js";

export default function Page() {
  return (
    <>
      <h1 className={"font-bold text-3xl pb-4"}>Scrabble Game - Phase 1 Demo</h1>
      <div className="space-y-4">
        <p>Welcome to our multiplayer Scrabble game! We've completed Phase 1: Foundation & Game Core.</p>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="font-semibold text-lg mb-2">✅ Phase 1 Completed:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Database schema with PostgreSQL (games, players, moves, dictionary)</li>
            <li>Core game logic (board management, tile distribution, scoring)</li>
            <li>Basic UI components (Board, TileRack, ScoreDisplay, GameInfo)</li>
            <li>tRPC API endpoints for game operations</li>
            <li>Word validation system with dictionary</li>
          </ul>
        </div>
        
        <div className="flex space-x-4">
          <a 
            href="/game" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🎮 Play Demo Game
          </a>
          <a 
            href="/todo" 
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            📝 Todo Demo
          </a>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="font-semibold text-lg mb-2">🚀 Coming Next (Phase 2):</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Interactive drag-and-drop tile placement</li>
            <li>Real-time game logic and validation</li>
            <li>Complete single-player Scrabble functionality</li>
            <li>AI opponent integration</li>
          </ul>
        </div>
      </div>
    </>
  );
}

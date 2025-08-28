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
        
        <div className="flex flex-wrap gap-4">
          <a 
            href="/game" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🎮 Static Demo Game
          </a>
          <a 
            href="/interactive-game" 
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            🎯 Interactive Game (Phase 2)
          </a>
          <a 
            href="/multiplayer" 
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            👥 Multiplayer Lobby (Phase 3)
          </a>
          <a 
            href="/todo" 
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            📝 Todo Demo
          </a>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="font-semibold text-lg mb-2">✅ Phase 2 Completed - Interactive Gameplay:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>✅ Drag-and-drop tile placement with visual feedback</li>
            <li>✅ Real-time move validation and error display</li>
            <li>✅ Interactive game controls (submit, pass, exchange, recall)</li>
            <li>✅ Move preview and live score calculation</li>
            <li>✅ Enhanced visual design with border merging</li>
            <li>✅ Tile rack with draggable tiles and controls</li>
          </ul>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="font-semibold text-lg mb-2">🚀 Phase 3 - Multiplayer Real-time (In Progress):</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>🔄 WebSocket integration for real-time communication</li>
            <li>🔄 Game room creation and management</li>
            <li>🔄 Turn synchronization between players</li>
            <li>🔄 Live move broadcasting to all players</li>
            <li>🔄 Player presence and connection status</li>
            <li>🔄 Multiplayer lobby with room listing</li>
          </ul>
        </div>
      </div>
    </>
  );
}

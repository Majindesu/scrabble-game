import type { PageContextServer } from "vike/types";
import { BoardCell } from "../../database/drizzle/schema/games";
import { getPremiumSquareType } from "../../lib/game/constants";

export type Data = {
  game: {
    id: string;
    status: "active";
    board: BoardCell[][];
    currentPlayer: {
      id: string;
      name: string;
      score: number;
      tiles: string[];
    };
    players: Array<{
      id: number;
      name: string;
      score: number;
      isCurrentTurn: boolean;
    }>;
    tilesRemaining: number;
    lastMove: {
      player: string;
      word: string;
      score: number;
    };
  };
};

export default async function data(_pageContext: PageContextServer): Promise<Data> {
  // Create mock board with premium squares
  const board: BoardCell[][] = Array(15).fill(null).map((_, row) =>
    Array(15).fill(null).map((_, col) => {
      const premiumType = getPremiumSquareType(row, col);
      const cell: BoardCell = {};
      
      if (premiumType) {
        cell.premium = premiumType;
      }
      
      // Add some demo tiles for testing (the existing "HELLO" word)
      if (row === 7 && col === 6) {
        cell.tile = { letter: 'H', points: 4, playerId: 1 };
      } else if (row === 7 && col === 7) {
        cell.tile = { letter: 'E', points: 1, playerId: 1 };
        cell.premium = 'STAR'; // Center star
      } else if (row === 7 && col === 8) {
        cell.tile = { letter: 'L', points: 1, playerId: 1 };
      } else if (row === 7 && col === 9) {
        cell.tile = { letter: 'L', points: 1, playerId: 1 };
      } else if (row === 7 && col === 10) {
        cell.tile = { letter: 'O', points: 1, playerId: 1 };
      }
      
      return cell;
    })
  );

  return {
    game: {
      id: "interactive-game-1",
      status: "active" as const,
      board,
      currentPlayer: {
        id: "player-1",
        name: "You",
        score: 42,
        tiles: ["S", "C", "R", "A", "B", "B", "L"]
      },
      players: [
        { id: 1, name: "You", score: 42, isCurrentTurn: true },
        { id: 2, name: "Computer", score: 38, isCurrentTurn: false }
      ],
      tilesRemaining: 75,
      lastMove: {
        player: "Computer",
        word: "HELLO",
        score: 12
      }
    }
  };
}

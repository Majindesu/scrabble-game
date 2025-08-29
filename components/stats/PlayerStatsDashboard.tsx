import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, Target, Clock, Award } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PlayerStats {
  id: string;
  playerName: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalScore: number;
  highestScore: number;
  averageScore: number;
  bestWord?: string;
  bestWordScore: number;
  lastPlayed?: Date;
}

interface GameHistoryItem {
  id: string;
  gameId: string;
  playerNames: string[];
  finalScores: { [key: string]: number };
  winnerName?: string;
  gameStatus: string;
  gameDuration?: number;
  completedAt: Date;
}

// Simple UI Components
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", className)}>
      {children}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4 border-b border-gray-200">{children}</div>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>;
}

function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' }) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800"
  };
  
  return (
    <span className={cn(baseClasses, variantClasses[variant])}>
      {children}
    </span>
  );
}

export function PlayerStatsDashboard({ playerId }: { playerId: string }) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, these would be API calls
    // For now, we'll use mock data
    setLoading(true);
    
    // Mock player stats
    const mockStats: PlayerStats = {
      id: playerId,
      playerName: 'Player',
      gamesPlayed: 15,
      gamesWon: 8,
      gamesLost: 7,
      totalScore: 2340,
      highestScore: 287,
      averageScore: 156,
      bestWord: 'QUARTZ',
      bestWordScore: 84,
      lastPlayed: new Date()
    };

    // Mock game history
    const mockHistory: GameHistoryItem[] = [
      {
        id: '1',
        gameId: 'game1',
        playerNames: ['You', 'Player2'],
        finalScores: { [playerId]: 245, 'player2': 198 },
        winnerName: 'You',
        gameStatus: 'finished',
        gameDuration: 35,
        completedAt: new Date()
      }
    ];

    // Mock leaderboard
    const mockLeaderboard: PlayerStats[] = [
      mockStats,
      {
        id: '2',
        playerName: 'WordMaster',
        gamesPlayed: 42,
        gamesWon: 28,
        gamesLost: 14,
        totalScore: 7200,
        highestScore: 312,
        averageScore: 171,
        bestWordScore: 0
      },
      {
        id: '3',
        playerName: 'ScrabbleKing',
        gamesPlayed: 38,
        gamesWon: 25,
        gamesLost: 13,
        totalScore: 6890,
        highestScore: 298,
        averageScore: 181,
        bestWordScore: 0
      }
    ];

    setTimeout(() => {
      setStats(mockStats);
      setGameHistory(mockHistory);
      setLeaderboard(mockLeaderboard);
      setLoading(false);
    }, 1000);
  }, [playerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your statistics...</p>
        </div>
      </div>
    );
  }

  const winRate = stats ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Player Statistics
          </h1>
          <p className="text-gray-600">Track your Scrabble performance and compete with others</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Games Played</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.gamesPlayed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Win Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{winRate}%</p>
                    <p className="text-xs text-gray-500">{stats.gamesWon}W / {stats.gamesLost}L</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageScore}</p>
                    <p className="text-xs text-gray-500">Best: {stats.highestScore}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Best Word</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.bestWord}</p>
                    <p className="text-xs text-gray-500">{stats.bestWordScore} points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>🏆 Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                        index === 0 ? "bg-yellow-100 text-yellow-800" :
                        index === 1 ? "bg-gray-100 text-gray-800" :
                        index === 2 ? "bg-orange-100 text-orange-800" :
                        "bg-blue-100 text-blue-800"
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{player.playerName}</p>
                        <p className="text-sm text-gray-600">
                          {player.gamesWon}W / {player.gamesLost}L
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{player.averageScore}</p>
                      <p className="text-sm text-gray-600">avg</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Games */}
          <Card>
            <CardHeader>
              <CardTitle>📜 Recent Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gameHistory.map((game) => (
                  <div key={game.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          vs {game.playerNames.filter(name => name !== 'You').join(', ')}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {game.gameDuration} minutes
                        </p>
                      </div>
                      <Badge variant={game.winnerName === 'You' ? 'success' : 'default'}>
                        {game.winnerName === 'You' ? 'Won' : 'Lost'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Your Score: {Object.values(game.finalScores)[0]}</span>
                      <span className="text-gray-600">
                        {new Date(game.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {gameHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No games played yet</p>
                    <p className="text-sm">Start playing to see your history!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to Game Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlayerStatsDashboard;

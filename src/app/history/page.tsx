'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { GameStats } from '@/components/chess/GameStatus';
import { PieceIcon } from '@/components/chess/ChessPiece';
import { GameHistory, PlayerStats, Move } from '@/types/chess';
import { cn } from '@/lib/utils';
import {
  Crown,
  Home,
  Search,
  Calendar,
  Clock,
  Trophy,
  TrendingUp,
  BarChart3,
  Filter,
  Download,
  Eye,
  Play
} from 'lucide-react';

// Mock data for demonstration
const MOCK_GAME_HISTORY: GameHistory[] = [
  {
    id: 'game-1',
    playerName: 'You',
    opponent: 'AI (Medium)',
    result: 'win',
    moves: [],
    duration: 1245,
    rating: 1250,
    date: new Date(Date.now() - 86400000), // 1 day ago
    opening: 'Italian Game'
  },
  {
    id: 'game-2',
    playerName: 'You',
    opponent: 'AI (Hard)',
    result: 'loss',
    moves: [],
    duration: 2156,
    rating: 1235,
    date: new Date(Date.now() - 172800000), // 2 days ago
    opening: 'Sicilian Defense'
  },
  {
    id: 'game-3',
    playerName: 'You',
    opponent: 'AI (Medium)',
    result: 'draw',
    moves: [],
    duration: 1834,
    rating: 1240,
    date: new Date(Date.now() - 259200000), // 3 days ago
    opening: 'Queen\'s Gambit'
  },
  {
    id: 'game-4',
    playerName: 'You',
    opponent: 'AI (Easy)',
    result: 'win',
    moves: [],
    duration: 892,
    rating: 1245,
    date: new Date(Date.now() - 345600000), // 4 days ago
    opening: 'King\'s Pawn Game'
  },
  {
    id: 'game-5',
    playerName: 'You',
    opponent: 'AI (Hard)',
    result: 'loss',
    moves: [],
    duration: 2567,
    rating: 1220,
    date: new Date(Date.now() - 432000000), // 5 days ago
    opening: 'French Defense'
  }
];

const MOCK_PLAYER_STATS: PlayerStats = {
  gamesPlayed: 47,
  wins: 28,
  losses: 15,
  draws: 4,
  winRate: 0.596,
  averageGameLength: 1456,
  favoriteOpening: 'Italian Game',
  currentStreak: 2,
  bestStreak: 7,
  rating: 1250
};

export default function HistoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'wins' | 'losses' | 'draws'>('all');
  const [gameHistory] = useState<GameHistory[]>(MOCK_GAME_HISTORY);
  const [playerStats] = useState<PlayerStats>(MOCK_PLAYER_STATS);

  const filteredHistory = gameHistory.filter(game => {
    const matchesSearch = game.opponent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.opening?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === 'all' || game.result === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  };

  const getResultBadgeVariant = (result: 'win' | 'loss' | 'draw') => {
    switch (result) {
      case 'win': return 'default';
      case 'loss': return 'destructive';
      case 'draw': return 'secondary';
    }
  };

  const getResultColor = (result: 'win' | 'loss' | 'draw') => {
    switch (result) {
      case 'win': return 'text-chess-highlight';
      case 'loss': return 'text-chess-danger';
      case 'draw': return 'text-chess-text-muted';
    }
  };

  return (
    <div className="min-h-screen bg-chess-background">
      {/* Header */}
      <header className="bg-chess-surface border-b border-chess-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-chess-text-muted hover:text-chess-text-light"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <div className="text-chess-text-light font-semibold">
              Game History & Analysis
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-chess-highlight" />
            <span className="text-chess-text-light font-semibold">Chess Prime</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-chess-surface border border-chess-border">
            <TabsTrigger value="history" className="text-chess-text-muted data-[state=active]:text-chess-text-light">
              <BarChart3 className="w-4 h-4 mr-2" />
              Game History
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-chess-text-muted data-[state=active]:text-chess-text-light">
              <TrendingUp className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-chess-surface border-chess-border">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-chess-text-muted" />
                    <Input
                      placeholder="Search by opponent or opening..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-chess-background border-chess-border text-chess-text-light"
                    />
                  </div>

                  <div className="flex gap-2">
                    {(['all', 'wins', 'losses', 'draws'] as const).map(filter => (
                      <Button
                        key={filter}
                        variant={selectedFilter === filter ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedFilter(filter)}
                        className={cn(
                          'capitalize',
                          selectedFilter === filter
                            ? 'bg-chess-highlight text-chess-background'
                            : 'border-chess-border text-chess-text-muted hover:text-chess-text-light'
                        )}
                      >
                        {filter}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game List */}
            <Card className="bg-chess-surface border-chess-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-chess-text-light">
                    Recent Games ({filteredHistory.length})
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-chess-text-muted hover:text-chess-text-light"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {filteredHistory.map((game) => (
                      <div
                        key={game.id}
                        className="p-4 rounded-lg bg-chess-background/50 border border-chess-border hover:border-chess-highlight/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className={cn('w-3 h-3 rounded-full', {
                                'bg-chess-highlight': game.result === 'win',
                                'bg-chess-danger': game.result === 'loss',
                                'bg-chess-text-muted': game.result === 'draw'
                              })} />
                              <Badge variant={getResultBadgeVariant(game.result)}>
                                {game.result.toUpperCase()}
                              </Badge>
                            </div>

                            <div>
                              <div className="font-semibold text-chess-text-light">
                                vs {game.opponent}
                              </div>
                              <div className="text-sm text-chess-text-muted flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(game.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(game.duration)}
                                </span>
                                {game.opening && (
                                  <span>{game.opening}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {game.rating && (
                              <div className="text-right">
                                <div className="text-sm text-chess-text-muted">Rating</div>
                                <div className="font-semibold text-chess-text-light">
                                  {game.rating}
                                </div>
                              </div>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-chess-text-muted hover:text-chess-text-light"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-chess-text-muted hover:text-chess-text-light"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredHistory.length === 0 && (
                      <div className="text-center py-12">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-chess-text-muted opacity-50" />
                        <div className="text-chess-text-muted">
                          No games found matching your criteria
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Player Statistics */}
              <GameStats
                gamesPlayed={playerStats.gamesPlayed}
                wins={playerStats.wins}
                losses={playerStats.losses}
                draws={playerStats.draws}
                rating={playerStats.rating}
                winRate={playerStats.winRate}
              />

              {/* Detailed Stats */}
              <Card className="bg-chess-surface border-chess-border">
                <CardHeader>
                  <CardTitle className="text-chess-text-light flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Performance Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-chess-text-muted">Current Streak</span>
                      <div className="flex items-center gap-2">
                        <span className="text-chess-text-light font-semibold">
                          {playerStats.currentStreak}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {playerStats.currentStreak > 0 ? 'Wins' : 'Games'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-chess-text-muted">Best Streak</span>
                      <span className="text-chess-highlight font-semibold">
                        {playerStats.bestStreak} wins
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-chess-text-muted">Avg Game Length</span>
                      <span className="text-chess-text-light font-semibold">
                        {formatDuration(playerStats.averageGameLength)}
                      </span>
                    </div>

                    {playerStats.favoriteOpening && (
                      <div className="flex justify-between items-center">
                        <span className="text-chess-text-muted">Favorite Opening</span>
                        <span className="text-chess-text-light font-semibold">
                          {playerStats.favoriteOpening}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Opening Analysis */}
            <Card className="bg-chess-surface border-chess-border">
              <CardHeader>
                <CardTitle className="text-chess-text-light">Opening Analysis</CardTitle>
                <p className="text-sm text-chess-text-muted">
                  Your performance with different openings
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Italian Game', 'Sicilian Defense', 'Queen\'s Gambit', 'French Defense'].map((opening, index) => {
                    const stats = {
                      'Italian Game': { played: 8, wins: 6, winRate: 0.75 },
                      'Sicilian Defense': { played: 6, wins: 3, winRate: 0.5 },
                      'Queen\'s Gambit': { played: 5, wins: 3, winRate: 0.6 },
                      'French Defense': { played: 4, wins: 2, winRate: 0.5 }
                    }[opening] || { played: 0, wins: 0, winRate: 0 };

                    return (
                      <div key={opening} className="flex items-center justify-between p-3 bg-chess-background/50 rounded-lg">
                        <div>
                          <div className="font-semibold text-chess-text-light">{opening}</div>
                          <div className="text-sm text-chess-text-muted">
                            {stats.played} games played
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-chess-text-light font-semibold">
                            {stats.wins}/{stats.played}
                          </div>
                          <div className="text-sm text-chess-text-muted">
                            {(stats.winRate * 100).toFixed(0)}% win rate
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
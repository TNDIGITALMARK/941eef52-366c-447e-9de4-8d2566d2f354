'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PieceIcon } from '@/components/chess/ChessPiece';
import { Difficulty, GameSettings } from '@/types/chess';
import { cn } from '@/lib/utils';
import {
  Crown,
  Home,
  Play,
  Bot,
  User,
  Clock,
  Lightbulb,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  Target,
  Trophy,
  Cpu
} from 'lucide-react';

const DIFFICULTY_OPTIONS: {
  value: Difficulty;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: 'easy',
    label: 'Beginner',
    description: 'Perfect for learning the basics',
    icon: <Target className="w-5 h-5" />,
    color: 'text-green-500'
  },
  {
    value: 'medium',
    label: 'Intermediate',
    description: 'Balanced challenge for casual play',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-500'
  },
  {
    value: 'hard',
    label: 'Advanced',
    description: 'Serious challenge for experienced players',
    icon: <Trophy className="w-5 h-5" />,
    color: 'text-orange-500'
  },
  {
    value: 'expert',
    label: 'Master',
    description: 'Ultimate test of chess mastery',
    icon: <Cpu className="w-5 h-5" />,
    color: 'text-red-500'
  }
];

export default function SetupPage() {
  const router = useRouter();

  const [gameSettings, setGameSettings] = useState<GameSettings>({
    difficulty: 'medium',
    playerColor: 'white',
    aiColor: 'black',
    allowUndo: true,
    showHints: false,
    timeControl: undefined
  });

  const [gameMode, setGameMode] = useState<'ai' | 'local'>('ai');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeControlEnabled, setTimeControlEnabled] = useState(false);
  const [timeMinutes, setTimeMinutes] = useState(15);
  const [timeIncrement, setTimeIncrement] = useState(10);

  const handleStartGame = () => {
    // Store game settings in sessionStorage for the game page to use
    const finalSettings = {
      ...gameSettings,
      timeControl: timeControlEnabled ? {
        minutes: timeMinutes,
        increment: timeIncrement
      } : undefined
    };

    sessionStorage.setItem('chessGameSettings', JSON.stringify({
      ...finalSettings,
      gameMode,
      soundEnabled
    }));

    router.push('/game');
  };

  const handleColorSwap = () => {
    setGameSettings(prev => ({
      ...prev,
      playerColor: prev.playerColor === 'white' ? 'black' : 'white',
      aiColor: prev.aiColor === 'white' ? 'black' : 'white'
    }));
  };

  const selectedDifficulty = DIFFICULTY_OPTIONS.find(d => d.value === gameSettings.difficulty)!;

  return (
    <div className="min-h-screen bg-chess-background">
      {/* Header */}
      <header className="bg-chess-surface border-b border-chess-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
              Game Setup
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-chess-highlight" />
            <span className="text-chess-text-light font-semibold">Chess Prime</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Game Mode Selection */}
          <Card className="bg-chess-surface border-chess-border">
            <CardHeader>
              <CardTitle className="text-chess-text-light flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Game Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setGameMode('ai')}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    gameMode === 'ai'
                      ? 'border-chess-highlight bg-chess-highlight/10'
                      : 'border-chess-border hover:border-chess-highlight/50 bg-chess-background/50'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Bot className="w-6 h-6 text-chess-highlight" />
                    <span className="font-semibold text-chess-text-light">vs AI</span>
                    {gameMode === 'ai' && (
                      <Badge className="bg-chess-highlight text-chess-background">Selected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-chess-text-muted">
                    Challenge an intelligent computer opponent
                  </p>
                </button>

                <button
                  onClick={() => setGameMode('local')}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    gameMode === 'local'
                      ? 'border-chess-highlight bg-chess-highlight/10'
                      : 'border-chess-border hover:border-chess-highlight/50 bg-chess-background/50'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-6 h-6 text-chess-highlight" />
                    <span className="font-semibold text-chess-text-light">Local Play</span>
                    {gameMode === 'local' && (
                      <Badge className="bg-chess-highlight text-chess-background">Selected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-chess-text-muted">
                    Play with a friend on the same device
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* AI Difficulty (only shown for AI mode) */}
          {gameMode === 'ai' && (
            <Card className="bg-chess-surface border-chess-border">
              <CardHeader>
                <CardTitle className="text-chess-text-light flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  AI Difficulty
                </CardTitle>
                <p className="text-sm text-chess-text-muted">
                  Choose your challenge level
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGameSettings(prev => ({ ...prev, difficulty: option.value }))}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all text-left',
                        gameSettings.difficulty === option.value
                          ? 'border-chess-highlight bg-chess-highlight/10'
                          : 'border-chess-border hover:border-chess-highlight/50 bg-chess-background/50'
                      )}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={option.color}>
                          {option.icon}
                        </div>
                        <span className="font-semibold text-chess-text-light">
                          {option.label}
                        </span>
                        {gameSettings.difficulty === option.value && (
                          <Badge className="bg-chess-highlight text-chess-background text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-chess-text-muted">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Current Selection Info */}
                <div className="mt-6 p-4 bg-chess-background/50 rounded-lg border border-chess-border">
                  <div className="flex items-center gap-3">
                    <div className={selectedDifficulty.color}>
                      {selectedDifficulty.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-chess-text-light">
                        {selectedDifficulty.label} Level Selected
                      </div>
                      <div className="text-sm text-chess-text-muted">
                        {selectedDifficulty.description}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Player Color Selection */}
          <Card className="bg-chess-surface border-chess-border">
            <CardHeader>
              <CardTitle className="text-chess-text-light flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Player Color
              </CardTitle>
              <p className="text-sm text-chess-text-muted">
                Choose which color you want to play as
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setGameSettings(prev => ({
                    ...prev,
                    playerColor: 'white',
                    aiColor: 'black'
                  }))}
                  className={cn(
                    'flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all',
                    gameSettings.playerColor === 'white'
                      ? 'border-chess-highlight bg-chess-highlight/10'
                      : 'border-chess-border hover:border-chess-highlight/50'
                  )}
                >
                  <PieceIcon type="king" color="white" className="w-12 h-12" />
                  <div className="text-center">
                    <div className="font-semibold text-chess-text-light">White</div>
                    <div className="text-sm text-chess-text-muted">Moves first</div>
                  </div>
                  {gameSettings.playerColor === 'white' && (
                    <Badge className="bg-chess-highlight text-chess-background">You</Badge>
                  )}
                </button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleColorSwap}
                  className="text-chess-text-muted hover:text-chess-text-light"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <button
                  onClick={() => setGameSettings(prev => ({
                    ...prev,
                    playerColor: 'black',
                    aiColor: 'white'
                  }))}
                  className={cn(
                    'flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all',
                    gameSettings.playerColor === 'black'
                      ? 'border-chess-highlight bg-chess-highlight/10'
                      : 'border-chess-border hover:border-chess-highlight/50'
                  )}
                >
                  <PieceIcon type="king" color="black" className="w-12 h-12" />
                  <div className="text-center">
                    <div className="font-semibold text-chess-text-light">Black</div>
                    <div className="text-sm text-chess-text-muted">Moves second</div>
                  </div>
                  {gameSettings.playerColor === 'black' && (
                    <Badge className="bg-chess-highlight text-chess-background">You</Badge>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Game Options */}
          <Card className="bg-chess-surface border-chess-border">
            <CardHeader>
              <CardTitle className="text-chess-text-light">Game Options</CardTitle>
              <p className="text-sm text-chess-text-muted">
                Customize your gameplay experience
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gameplay Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-5 h-5 text-chess-text-muted" />
                    <div>
                      <Label htmlFor="allow-undo" className="text-chess-text-light">
                        Allow Undo
                      </Label>
                      <p className="text-sm text-chess-text-muted">
                        Let players take back moves
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="allow-undo"
                    checked={gameSettings.allowUndo}
                    onCheckedChange={(checked) =>
                      setGameSettings(prev => ({ ...prev, allowUndo: checked }))
                    }
                  />
                </div>

                <Separator className="bg-chess-border" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="w-5 h-5 text-chess-text-muted" />
                    <div>
                      <Label htmlFor="show-hints" className="text-chess-text-light">
                        Show Move Hints
                      </Label>
                      <p className="text-sm text-chess-text-muted">
                        Highlight possible moves when piece is selected
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="show-hints"
                    checked={gameSettings.showHints}
                    onCheckedChange={(checked) =>
                      setGameSettings(prev => ({ ...prev, showHints: checked }))
                    }
                  />
                </div>

                <Separator className="bg-chess-border" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? <Volume2 className="w-5 h-5 text-chess-text-muted" /> : <VolumeX className="w-5 h-5 text-chess-text-muted" />}
                    <div>
                      <Label htmlFor="sound-enabled" className="text-chess-text-light">
                        Sound Effects
                      </Label>
                      <p className="text-sm text-chess-text-muted">
                        Play sounds for moves and captures
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="sound-enabled"
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Control */}
          <Card className="bg-chess-surface border-chess-border">
            <CardHeader>
              <CardTitle className="text-chess-text-light flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Time Control
              </CardTitle>
              <p className="text-sm text-chess-text-muted">
                Add time pressure to your games
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="time-control" className="text-chess-text-light">
                    Enable Time Control
                  </Label>
                  <Switch
                    id="time-control"
                    checked={timeControlEnabled}
                    onCheckedChange={setTimeControlEnabled}
                  />
                </div>

                {timeControlEnabled && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-chess-border">
                    <div>
                      <Label className="text-chess-text-light text-sm">
                        Time per player (minutes)
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTimeMinutes(Math.max(1, timeMinutes - 5))}
                          className="border-chess-border text-chess-text-muted hover:text-chess-text-light"
                        >
                          -5
                        </Button>
                        <div className="text-chess-text-light font-semibold min-w-[3rem] text-center">
                          {timeMinutes}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTimeMinutes(timeMinutes + 5)}
                          className="border-chess-border text-chess-text-muted hover:text-chess-text-light"
                        >
                          +5
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-chess-text-light text-sm">
                        Increment (seconds)
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTimeIncrement(Math.max(0, timeIncrement - 5))}
                          className="border-chess-border text-chess-text-muted hover:text-chess-text-light"
                        >
                          -5
                        </Button>
                        <div className="text-chess-text-light font-semibold min-w-[3rem] text-center">
                          {timeIncrement}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTimeIncrement(timeIncrement + 5)}
                          className="border-chess-border text-chess-text-muted hover:text-chess-text-light"
                        >
                          +5
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Start Game Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleStartGame}
              className="bg-chess-highlight hover:bg-chess-highlight/80 text-chess-background font-semibold px-12 py-4 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
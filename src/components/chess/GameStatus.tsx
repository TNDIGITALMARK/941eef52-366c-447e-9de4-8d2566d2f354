'use client';

import { GameStatus as GameStatusType, PieceColor } from '@/types/chess';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PieceIcon } from './ChessPiece';
import { cn } from '@/lib/utils';
import {
  Crown,
  AlertTriangle,
  Users,
  Trophy,
  Play,
  RotateCcw,
  Flag
} from 'lucide-react';

interface GameStatusProps {
  status: GameStatusType;
  currentPlayer: PieceColor;
  winner?: PieceColor;
  playerColor?: PieceColor;
  isPlayerTurn?: boolean;
  moveCount?: number;
  timeElapsed?: number;
  onNewGame?: () => void;
  onResign?: () => void;
  onOfferDraw?: () => void;
  className?: string;
}

export function GameStatus({
  status,
  currentPlayer,
  winner,
  playerColor = 'white',
  isPlayerTurn = true,
  moveCount = 0,
  timeElapsed = 0,
  onNewGame,
  onResign,
  onOfferDraw,
  className
}: GameStatusProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'check':
        return {
          title: 'Check!',
          message: `${currentPlayer === 'white' ? 'White' : 'Black'} king is in check`,
          icon: <AlertTriangle className="w-5 h-5 text-chess-danger" />,
          variant: 'destructive' as const
        };

      case 'checkmate':
        const winnerName = winner === 'white' ? 'White' : 'Black';
        const isPlayerWin = winner === playerColor;
        return {
          title: 'Checkmate!',
          message: `${winnerName} wins by checkmate`,
          icon: <Crown className="w-5 h-5 text-chess-highlight" />,
          variant: isPlayerWin ? 'default' : 'secondary' as const
        };

      case 'stalemate':
        return {
          title: 'Stalemate!',
          message: 'Game ends in a draw',
          icon: <Users className="w-5 h-5 text-chess-text-muted" />,
          variant: 'outline' as const
        };

      case 'draw':
        return {
          title: 'Draw!',
          message: 'Game ends in a draw',
          icon: <Users className="w-5 h-5 text-chess-text-muted" />,
          variant: 'outline' as const
        };

      default:
        return {
          title: isPlayerTurn ? 'Your turn' : 'Opponent\'s turn',
          message: `${currentPlayer === 'white' ? 'White' : 'Black'} to move`,
          icon: <Play className="w-5 h-5 text-chess-highlight" />,
          variant: 'default' as const
        };
    }
  };

  const statusInfo = getStatusMessage();
  const isGameOver = ['checkmate', 'stalemate', 'draw'].includes(status);

  return (
    <Card className={cn('w-full max-w-md bg-chess-surface border-chess-border', className)}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Status Header */}
          <div className="flex items-center gap-3">
            {statusInfo.icon}
            <div className="flex-1">
              <h3 className="font-semibold text-chess-text-light">
                {statusInfo.title}
              </h3>
              <p className="text-sm text-chess-text-muted">
                {statusInfo.message}
              </p>
            </div>
            <Badge variant={statusInfo.variant} className="text-xs">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>

          {/* Current Player Indicator */}
          {!isGameOver && (
            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-chess-border/20 rounded-lg">
              <PieceIcon
                type="king"
                color={currentPlayer}
                className="w-6 h-6"
              />
              <span className="text-chess-text-light font-medium">
                {currentPlayer === 'white' ? 'White' : 'Black'}
                {currentPlayer === playerColor ? ' (You)' : ' (Opponent)'}
              </span>
              {isPlayerTurn && (
                <div className="w-2 h-2 bg-chess-highlight rounded-full animate-pulse" />
              )}
            </div>
          )}

          {/* Game Over Message */}
          {isGameOver && (
            <div className="text-center py-4">
              <div className="flex justify-center mb-2">
                {status === 'checkmate' ? (
                  <Trophy className="w-8 h-8 text-chess-highlight" />
                ) : (
                  <Users className="w-8 h-8 text-chess-text-muted" />
                )}
              </div>
              <h4 className="text-lg font-semibold text-chess-text-light mb-1">
                Game Over
              </h4>
              {status === 'checkmate' && winner && (
                <p className="text-chess-text-muted">
                  {winner === playerColor ? 'Congratulations!' : 'Better luck next time!'}
                </p>
              )}
            </div>
          )}

          {/* Game Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-chess-text-muted">Moves</div>
              <div className="font-semibold text-chess-text-light">
                {Math.ceil(moveCount / 2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-chess-text-muted">Time</div>
              <div className="font-semibold text-chess-text-light font-mono">
                {formatTime(timeElapsed)}
              </div>
            </div>
          </div>

          {/* Game Actions */}
          <div className="flex gap-2">
            {onNewGame && (
              <Button
                onClick={onNewGame}
                className="flex-1 bg-chess-highlight hover:bg-chess-highlight/80 text-chess-background"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Game
              </Button>
            )}

            {!isGameOver && (
              <>
                {onOfferDraw && (
                  <Button
                    onClick={onOfferDraw}
                    variant="outline"
                    size="sm"
                    className="border-chess-border text-chess-text-muted hover:text-chess-text-light"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Draw
                  </Button>
                )}

                {onResign && (
                  <Button
                    onClick={onResign}
                    variant="outline"
                    size="sm"
                    className="border-chess-danger text-chess-danger hover:bg-chess-danger hover:text-white"
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Resign
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface GameStatsProps {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  rating?: number;
  winRate: number;
  className?: string;
}

export function GameStats({
  gamesPlayed,
  wins,
  losses,
  draws,
  rating,
  winRate,
  className
}: GameStatsProps) {
  return (
    <Card className={cn('w-full max-w-md bg-chess-surface border-chess-border', className)}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-chess-text-light mb-1">
              Player Statistics
            </h3>
            {rating && (
              <div className="text-chess-accent font-bold text-lg">
                Rating: {rating}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-chess-highlight font-bold text-xl">{wins}</div>
              <div className="text-xs text-chess-text-muted">Wins</div>
            </div>
            <div>
              <div className="text-chess-text-muted font-bold text-xl">{draws}</div>
              <div className="text-xs text-chess-text-muted">Draws</div>
            </div>
            <div>
              <div className="text-chess-danger font-bold text-xl">{losses}</div>
              <div className="text-xs text-chess-text-muted">Losses</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-chess-text-muted">Games Played</span>
              <span className="text-chess-text-light font-semibold">{gamesPlayed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-chess-text-muted">Win Rate</span>
              <span className="text-chess-text-light font-semibold">
                {(winRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="w-full bg-chess-border rounded-full h-2">
            <div
              className="bg-chess-highlight h-2 rounded-full transition-all duration-300"
              style={{ width: `${winRate * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
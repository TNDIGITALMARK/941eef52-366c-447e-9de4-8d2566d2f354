'use client';

import { Move, PieceColor } from '@/types/chess';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieceIcon } from './ChessPiece';
import { cn } from '@/lib/utils';
import { Clock, RotateCcw, Copy, Download } from 'lucide-react';

interface MoveHistoryProps {
  moves: Move[];
  currentMoveIndex?: number;
  onMoveSelect?: (moveIndex: number) => void;
  onExportPGN?: () => void;
  onCopyMoves?: () => void;
  gameResult?: 'white-wins' | 'black-wins' | 'draw' | 'ongoing';
  className?: string;
}

interface MovePair {
  moveNumber: number;
  whiteMove?: Move;
  blackMove?: Move;
}

export function MoveHistory({
  moves,
  currentMoveIndex = moves.length - 1,
  onMoveSelect,
  onExportPGN,
  onCopyMoves,
  gameResult = 'ongoing',
  className
}: MoveHistoryProps) {
  // Group moves into pairs (white, black)
  const movePairs: MovePair[] = [];

  for (let i = 0; i < moves.length; i += 2) {
    const whiteMove = moves[i];
    const blackMove = moves[i + 1];

    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      whiteMove,
      blackMove
    });
  }

  const formatMoveTime = (move: Move): string => {
    return move.timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMoveStatusIcon = (move: Move) => {
    if (move.isCheckmate) return '# ';
    if (move.isCheck) return '+ ';
    return '';
  };

  const getResultString = () => {
    switch (gameResult) {
      case 'white-wins': return '1-0';
      case 'black-wins': return '0-1';
      case 'draw': return '½-½';
      default: return '';
    }
  };

  const handleMoveClick = (moveIndex: number) => {
    if (onMoveSelect) {
      onMoveSelect(moveIndex);
    }
  };

  if (moves.length === 0) {
    return (
      <Card className={cn('w-full max-w-md', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-chess-text-light">
            <Clock className="w-5 h-5" />
            Move History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-chess-text-muted py-8">
            <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No moves yet</p>
            <p className="text-sm">Make your first move to start!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full max-w-md bg-chess-surface border-chess-border', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-chess-text-light">
            <Clock className="w-5 h-5" />
            Move History
          </CardTitle>
          <div className="flex items-center gap-1">
            {onCopyMoves && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopyMoves}
                className="h-8 px-2 text-chess-text-muted hover:text-chess-text-light"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
            {onExportPGN && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExportPGN}
                className="h-8 px-2 text-chess-text-muted hover:text-chess-text-light"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-chess-text-muted">
          <span>{moves.length} moves</span>
          {gameResult !== 'ongoing' && (
            <>
              <span>•</span>
              <span className="font-semibold text-chess-accent">
                {getResultString()}
              </span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="move-history h-96">
          <div className="space-y-1">
            {movePairs.map((pair) => (
              <div
                key={pair.moveNumber}
                className="flex items-center gap-2 py-1 px-2 rounded hover:bg-chess-border/20 transition-colors"
              >
                <div className="text-sm font-medium text-chess-text-muted min-w-[2rem]">
                  {pair.moveNumber}.
                </div>

                {/* White move */}
                {pair.whiteMove && (
                  <button
                    onClick={() => handleMoveClick((pair.moveNumber - 1) * 2)}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded text-sm font-mono transition-all',
                      'hover:bg-chess-highlight/20 hover:text-chess-text-light',
                      currentMoveIndex === (pair.moveNumber - 1) * 2
                        ? 'bg-chess-highlight/30 text-chess-text-light ring-1 ring-chess-highlight'
                        : 'text-chess-text-muted'
                    )}
                  >
                    <PieceIcon
                      type={pair.whiteMove.piece.type}
                      color="white"
                      className="w-3 h-3"
                    />
                    <span>
                      {pair.whiteMove.notation}
                      {getMoveStatusIcon(pair.whiteMove)}
                    </span>
                  </button>
                )}

                {/* Black move */}
                {pair.blackMove && (
                  <button
                    onClick={() => handleMoveClick((pair.moveNumber - 1) * 2 + 1)}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded text-sm font-mono transition-all',
                      'hover:bg-chess-highlight/20 hover:text-chess-text-light',
                      currentMoveIndex === (pair.moveNumber - 1) * 2 + 1
                        ? 'bg-chess-highlight/30 text-chess-text-light ring-1 ring-chess-highlight'
                        : 'text-chess-text-muted'
                    )}
                  >
                    <PieceIcon
                      type={pair.blackMove.piece.type}
                      color="black"
                      className="w-3 h-3"
                    />
                    <span>
                      {pair.blackMove.notation}
                      {getMoveStatusIcon(pair.blackMove)}
                    </span>
                  </button>
                )}
              </div>
            ))}

            {gameResult !== 'ongoing' && (
              <div className="flex justify-center py-2">
                <div className="px-3 py-1 bg-chess-accent/20 text-chess-accent font-semibold rounded">
                  {getResultString()}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface MoveDetailsProps {
  move: Move;
  moveNumber: number;
  color: PieceColor;
}

export function MoveDetails({ move, moveNumber, color }: MoveDetailsProps) {
  return (
    <Card className="w-full max-w-sm bg-chess-surface border-chess-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-chess-text-light">
          Move {Math.ceil(moveNumber / 2)}
          {color === 'white' ? '.1' : '.2'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <PieceIcon type={move.piece.type} color={move.piece.color} />
          <span className="font-mono text-lg text-chess-text-light">
            {move.notation}
            {getMoveStatusIcon(move)}
          </span>
        </div>

        <div className="space-y-2 text-sm text-chess-text-muted">
          <div className="flex justify-between">
            <span>Piece:</span>
            <span className="text-chess-text-light capitalize">
              {color} {move.piece.type}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Time:</span>
            <span className="text-chess-text-light font-mono">
              {formatMoveTime(move)}
            </span>
          </div>

          {move.capturedPiece && (
            <div className="flex justify-between">
              <span>Captured:</span>
              <div className="flex items-center gap-1">
                <PieceIcon
                  type={move.capturedPiece.type}
                  color={move.capturedPiece.color}
                />
                <span className="text-chess-text-light capitalize">
                  {move.capturedPiece.color} {move.capturedPiece.type}
                </span>
              </div>
            </div>
          )}

          {move.isCastling && (
            <div className="text-chess-accent">
              Special: Castling
            </div>
          )}

          {move.isEnPassant && (
            <div className="text-chess-accent">
              Special: En Passant
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Piece, Position, ValidMove } from '@/types/chess';
import { ChessPiece } from './ChessPiece';
import { cn } from '@/lib/utils';

interface ChessBoardProps {
  board: (Piece | null)[][];
  validMoves: ValidMove[];
  selectedPiece: Piece | null;
  currentPlayer: 'white' | 'black';
  onSquareClick: (position: Position) => void;
  onPieceMove: (piece: Piece, to: Position) => void;
  onPieceSelect: (piece: Piece | null) => void;
  isFlipped?: boolean;
  highlightedSquares?: Position[];
  lastMove?: { from: Position; to: Position };
  isPlayerTurn?: boolean;
}

interface DragState {
  isDragging: boolean;
  piece: Piece | null;
  startPosition: Position | null;
  mousePosition: { x: number; y: number };
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export function ChessBoard({
  board,
  validMoves,
  selectedPiece,
  currentPlayer,
  onSquareClick,
  onPieceMove,
  onPieceSelect,
  isFlipped = false,
  highlightedSquares = [],
  lastMove,
  isPlayerTurn = true
}: ChessBoardProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    piece: null,
    startPosition: null,
    mousePosition: { x: 0, y: 0 }
  });

  const boardRef = useRef<HTMLDivElement>(null);

  const getSquarePosition = useCallback((row: number, col: number): Position => {
    return isFlipped
      ? { row: 7 - row, col: 7 - col }
      : { row, col };
  }, [isFlipped]);

  const getDisplayPosition = useCallback((row: number, col: number): { row: number; col: number } => {
    return isFlipped
      ? { row: 7 - row, col: 7 - col }
      : { row, col };
  }, [isFlipped]);

  const isSquareHighlighted = useCallback((row: number, col: number): boolean => {
    const position = getSquarePosition(row, col);
    return highlightedSquares.some(pos => pos.row === position.row && pos.col === position.col);
  }, [highlightedSquares, getSquarePosition]);

  const isValidMoveSquare = useCallback((row: number, col: number): boolean => {
    if (!selectedPiece) return false;
    const position = getSquarePosition(row, col);
    return validMoves.some(move => move.to.row === position.row && move.to.col === position.col);
  }, [selectedPiece, validMoves, getSquarePosition]);

  const isLastMoveSquare = useCallback((row: number, col: number): boolean => {
    if (!lastMove) return false;
    const position = getSquarePosition(row, col);
    return (position.row === lastMove.from.row && position.col === lastMove.from.col) ||
           (position.row === lastMove.to.row && position.col === lastMove.to.col);
  }, [lastMove, getSquarePosition]);

  const handleMouseDown = useCallback((piece: Piece, e: React.MouseEvent) => {
    if (!isPlayerTurn || piece.color !== currentPlayer) return;

    e.preventDefault();
    e.stopPropagation();

    onPieceSelect(piece);

    setDragState({
      isDragging: true,
      piece,
      startPosition: piece.position,
      mousePosition: { x: e.clientX, y: e.clientY }
    });
  }, [isPlayerTurn, currentPlayer, onPieceSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState.isDragging) {
      setDragState(prev => ({
        ...prev,
        mousePosition: { x: e.clientX, y: e.clientY }
      }));
    }
  }, [dragState.isDragging]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.piece || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const squareSize = boardRect.width / 8;

    const relativeX = e.clientX - boardRect.left;
    const relativeY = e.clientY - boardRect.top;

    const col = Math.floor(relativeX / squareSize);
    const row = Math.floor(relativeY / squareSize);

    if (col >= 0 && col < 8 && row >= 0 && row < 8) {
      const targetPosition = getSquarePosition(row, col);

      if (targetPosition.row !== dragState.startPosition?.row ||
          targetPosition.col !== dragState.startPosition?.col) {
        onPieceMove(dragState.piece, targetPosition);
      }
    }

    setDragState({
      isDragging: false,
      piece: null,
      startPosition: null,
      mousePosition: { x: 0, y: 0 }
    });
  }, [dragState, getSquarePosition, onPieceMove]);

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (dragState.isDragging) return;

    const position = getSquarePosition(row, col);
    onSquareClick(position);
  }, [dragState.isDragging, getSquarePosition, onSquareClick]);

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  const renderSquare = (row: number, col: number) => {
    const position = getSquarePosition(row, col);
    const displayPos = getDisplayPosition(position.row, position.col);
    const piece = board[position.row][position.col];
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedPiece?.position.row === position.row &&
                      selectedPiece?.position.col === position.col;
    const isDraggedPiece = dragState.piece?.position.row === position.row &&
                          dragState.piece?.position.col === position.col;

    return (
      <div
        key={`${row}-${col}`}
        className={cn(
          'chess-square relative aspect-square flex items-center justify-center border border-chess-border/20',
          {
            'bg-chess-board-light': isLight,
            'bg-chess-board-dark': !isLight,
            'ring-2 ring-chess-highlight ring-inset': isSelected && !isDraggedPiece,
            'bg-chess-highlight/20': isValidMoveSquare(row, col),
            'bg-chess-accent/30': isSquareHighlighted(row, col),
            'bg-chess-accent/40': isLastMoveSquare(row, col),
          }
        )}
        onClick={() => handleSquareClick(row, col)}
      >
        {/* Square coordinates */}
        {col === 0 && (
          <div className="absolute left-1 top-1 text-xs font-medium text-chess-text-muted select-none">
            {RANKS[isFlipped ? 7 - row : row]}
          </div>
        )}
        {row === 7 && (
          <div className="absolute right-1 bottom-1 text-xs font-medium text-chess-text-muted select-none">
            {FILES[isFlipped ? 7 - col : col]}
          </div>
        )}

        {/* Valid move indicator */}
        {isValidMoveSquare(row, col) && !piece && (
          <div className="w-4 h-4 rounded-full bg-chess-highlight/60 border-2 border-chess-highlight" />
        )}

        {isValidMoveSquare(row, col) && piece && (
          <div className="absolute inset-0 border-4 border-chess-danger/60 rounded" />
        )}

        {/* Chess piece */}
        {piece && !isDraggedPiece && (
          <ChessPiece
            piece={piece}
            isSelected={isSelected}
            onMouseDown={(e) => handleMouseDown(piece, e)}
            className={cn(
              'transition-all duration-200',
              {
                'opacity-30': isDraggedPiece,
                'cursor-pointer': piece.color === currentPlayer && isPlayerTurn,
                'cursor-not-allowed': piece.color !== currentPlayer || !isPlayerTurn
              }
            )}
          />
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <div
        ref={boardRef}
        className="chess-board grid grid-cols-8 grid-rows-8 aspect-square max-w-2xl mx-auto bg-chess-border/50 p-2 rounded-lg shadow-2xl border-4 border-chess-surface w-full"
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(139, 69, 19, 0.1) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(139, 69, 19, 0.1) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(139, 69, 19, 0.1) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(139, 69, 19, 0.1) 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      >
        {Array.from({ length: 8 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => renderSquare(row, col))
        )}
      </div>

      {/* Dragged piece */}
      {dragState.isDragging && dragState.piece && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: dragState.mousePosition.x - 30,
            top: dragState.mousePosition.y - 30,
          }}
        >
          <ChessPiece
            piece={dragState.piece}
            isDragging={true}
            size="lg"
          />
        </div>
      )}
    </div>
  );
}
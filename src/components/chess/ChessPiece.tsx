'use client';

import { Piece, PieceType } from '@/types/chess';
import { cn } from '@/lib/utils';

interface ChessPieceProps {
  piece: Piece;
  size?: 'sm' | 'md' | 'lg';
  isDragging?: boolean;
  isSelected?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
  className?: string;
}

const PIECE_SYMBOLS = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
} as const;

const SIZE_STYLES = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-5xl'
} as const;

export function ChessPiece({
  piece,
  size = 'md',
  isDragging = false,
  isSelected = false,
  onMouseDown,
  onMouseUp,
  className
}: ChessPieceProps) {
  const symbol = PIECE_SYMBOLS[piece.color][piece.type];

  return (
    <div
      className={cn(
        'chess-piece flex items-center justify-center cursor-pointer select-none transition-all duration-200 ease-in-out',
        'hover:scale-110 active:scale-95',
        SIZE_STYLES[size],
        {
          'opacity-50 scale-110 z-50': isDragging,
          'ring-2 ring-chess-highlight ring-offset-2 ring-offset-chess-surface scale-105': isSelected,
          'filter drop-shadow-lg': piece.color === 'white',
          'text-chess-text-light': piece.color === 'white',
          'text-gray-900': piece.color === 'black',
        },
        className
      )}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      draggable={false}
      style={{
        textShadow: piece.color === 'white'
          ? '1px 1px 2px rgba(0,0,0,0.8)'
          : '1px 1px 2px rgba(255,255,255,0.3)',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {symbol}
    </div>
  );
}

interface PiecePreviewProps {
  type: PieceType;
  color: 'white' | 'black';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PiecePreview({ type, color, size = 'sm', className }: PiecePreviewProps) {
  const symbol = PIECE_SYMBOLS[color][type];

  return (
    <div
      className={cn(
        'flex items-center justify-center select-none',
        SIZE_STYLES[size],
        {
          'filter drop-shadow-sm': color === 'white',
          'text-chess-text-light': color === 'white',
          'text-gray-900': color === 'black',
        },
        className
      )}
      style={{
        textShadow: color === 'white'
          ? '1px 1px 1px rgba(0,0,0,0.6)'
          : '1px 1px 1px rgba(255,255,255,0.2)',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {symbol}
    </div>
  );
}

export function PieceIcon({
  type,
  color,
  className
}: {
  type: PieceType;
  color: 'white' | 'black';
  className?: string;
}) {
  return (
    <PiecePreview
      type={type}
      color={color}
      size="sm"
      className={cn('text-base', className)}
    />
  );
}
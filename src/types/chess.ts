export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';
export type GameStatus = 'active' | 'check' | 'checkmate' | 'stalemate' | 'draw';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  id: string;
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved: boolean;
}

export interface Move {
  id: string;
  piece: Piece;
  from: Position;
  to: Position;
  capturedPiece?: Piece;
  notation: string;
  timestamp: Date;
  isCheck: boolean;
  isCheckmate: boolean;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotionPiece?: PieceType;
}

export interface GameState {
  id: string;
  board: (Piece | null)[][];
  currentPlayer: PieceColor;
  status: GameStatus;
  moves: Move[];
  capturedPieces: {
    white: Piece[];
    black: Piece[];
  };
  gameSettings: GameSettings;
  isAIGame: boolean;
  startTime: Date;
  endTime?: Date;
}

export interface GameSettings {
  difficulty: Difficulty;
  playerColor: PieceColor;
  aiColor: PieceColor;
  timeControl?: {
    minutes: number;
    increment: number;
  };
  allowUndo: boolean;
  showHints: boolean;
}

export interface GameHistory {
  id: string;
  playerName: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  moves: Move[];
  duration: number;
  rating?: number;
  date: Date;
  opening?: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageGameLength: number;
  favoriteOpening?: string;
  currentStreak: number;
  bestStreak: number;
  rating: number;
}

export interface ValidMove {
  to: Position;
  isCapture: boolean;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotionOptions?: PieceType[];
}

export interface MoveValidation {
  isValid: boolean;
  reason?: string;
  specialMove?: 'castling' | 'enPassant' | 'promotion';
}

export interface AIMove {
  move: Move;
  evaluation: number;
  depth: number;
  principalVariation: Move[];
}

export const INITIAL_BOARD_STATE = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  // Place white pieces
  const whitePieces: [PieceType, number][] = [
    ['rook', 0], ['knight', 1], ['bishop', 2], ['queen', 3],
    ['king', 4], ['bishop', 5], ['knight', 6], ['rook', 7]
  ];

  whitePieces.forEach(([type, col]) => {
    board[7][col] = {
      id: `white-${type}-${col}`,
      type,
      color: 'white',
      position: { row: 7, col },
      hasMoved: false
    };
  });

  // White pawns
  for (let col = 0; col < 8; col++) {
    board[6][col] = {
      id: `white-pawn-${col}`,
      type: 'pawn',
      color: 'white',
      position: { row: 6, col },
      hasMoved: false
    };
  }

  // Place black pieces
  const blackPieces: [PieceType, number][] = [
    ['rook', 0], ['knight', 1], ['bishop', 2], ['queen', 3],
    ['king', 4], ['bishop', 5], ['knight', 6], ['rook', 7]
  ];

  blackPieces.forEach(([type, col]) => {
    board[0][col] = {
      id: `black-${type}-${col}`,
      type,
      color: 'black',
      position: { row: 0, col },
      hasMoved: false
    };
  });

  // Black pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = {
      id: `black-pawn-${col}`,
      type: 'pawn',
      color: 'black',
      position: { row: 1, col },
      hasMoved: false
    };
  }

  return board;
};

export const PIECE_VALUES = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0
} as const;

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

export const positionToAlgebraic = (position: Position): string => {
  return `${FILES[position.col]}${RANKS[position.row]}`;
};

export const algebraicToPosition = (algebraic: string): Position => {
  const file = algebraic[0];
  const rank = algebraic[1];
  return {
    col: FILES.indexOf(file as typeof FILES[number]),
    row: RANKS.indexOf(rank as typeof RANKS[number])
  };
};
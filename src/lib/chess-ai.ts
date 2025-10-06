import {
  GameState,
  Piece,
  Move,
  Position,
  Difficulty,
  AIMove,
  PieceColor,
  ValidMove,
  PIECE_VALUES
} from '@/types/chess';
import { ChessEngine } from './chess-engine';

interface EvaluationFactors {
  material: number;
  position: number;
  mobility: number;
  safety: number;
  control: number;
}

export class ChessAI {
  private difficulty: Difficulty;
  private maxDepth: number;
  private engine: ChessEngine;

  constructor(difficulty: Difficulty = 'medium') {
    this.difficulty = difficulty;
    this.maxDepth = this.getMaxDepth(difficulty);
    this.engine = null as any; // Will be set when making moves
  }

  private getMaxDepth(difficulty: Difficulty): number {
    switch (difficulty) {
      case 'easy': return 2;
      case 'medium': return 3;
      case 'hard': return 4;
      case 'expert': return 5;
      default: return 3;
    }
  }

  public async getBestMove(gameState: GameState, aiColor: PieceColor): Promise<AIMove> {
    this.engine = new ChessEngine(gameState);

    // Add thinking delay based on difficulty
    const thinkingTime = this.getThinkingTime();
    await new Promise(resolve => setTimeout(resolve, thinkingTime));

    const result = this.minimax(gameState, this.maxDepth, -Infinity, Infinity, true, aiColor);

    if (!result.move) {
      // Fallback to random move if minimax fails
      const randomMove = this.getRandomMove(gameState, aiColor);
      return {
        move: randomMove,
        evaluation: 0,
        depth: 0,
        principalVariation: [randomMove]
      };
    }

    return result;
  }

  private minimax(
    gameState: GameState,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean,
    aiColor: PieceColor
  ): AIMove {
    const engine = new ChessEngine({ ...gameState });

    // Base case: if depth is 0 or game is over
    if (depth === 0 || engine.getGameState().status !== 'active') {
      const evaluation = this.evaluatePosition(gameState, aiColor);
      return {
        move: null as any,
        evaluation,
        depth: this.maxDepth - depth,
        principalVariation: []
      };
    }

    const currentColor = gameState.currentPlayer;
    const allPossibleMoves = this.getAllPossibleMoves(gameState, currentColor);

    if (allPossibleMoves.length === 0) {
      const evaluation = engine.isInCheck(currentColor) ? -10000 : 0; // Checkmate or stalemate
      return {
        move: null as any,
        evaluation: maximizingPlayer ? evaluation : -evaluation,
        depth: this.maxDepth - depth,
        principalVariation: []
      };
    }

    // Sort moves for better alpha-beta pruning
    const sortedMoves = this.sortMoves(allPossibleMoves, gameState);
    let bestMove: Move | null = null;
    let bestEvaluation = maximizingPlayer ? -Infinity : Infinity;
    const principalVariation: Move[] = [];

    for (const move of sortedMoves) {
      // Make the move
      const newGameState = this.makeMove(gameState, move);

      // Recursively evaluate
      const result = this.minimax(
        newGameState,
        depth - 1,
        alpha,
        beta,
        !maximizingPlayer,
        aiColor
      );

      if (maximizingPlayer) {
        if (result.evaluation > bestEvaluation) {
          bestEvaluation = result.evaluation;
          bestMove = move;
          principalVariation.splice(0, principalVariation.length, move, ...result.principalVariation);
        }
        alpha = Math.max(alpha, result.evaluation);
      } else {
        if (result.evaluation < bestEvaluation) {
          bestEvaluation = result.evaluation;
          bestMove = move;
          principalVariation.splice(0, principalVariation.length, move, ...result.principalVariation);
        }
        beta = Math.min(beta, result.evaluation);
      }

      // Alpha-beta pruning
      if (beta <= alpha) {
        break;
      }
    }

    // Add some randomness for easier difficulties
    if (this.difficulty === 'easy' && Math.random() < 0.3) {
      const randomMove = sortedMoves[Math.floor(Math.random() * Math.min(3, sortedMoves.length))];
      bestMove = randomMove;
    } else if (this.difficulty === 'medium' && Math.random() < 0.15) {
      const randomMove = sortedMoves[Math.floor(Math.random() * Math.min(2, sortedMoves.length))];
      bestMove = randomMove;
    }

    return {
      move: bestMove!,
      evaluation: bestEvaluation,
      depth: this.maxDepth - depth,
      principalVariation
    };
  }

  private evaluatePosition(gameState: GameState, aiColor: PieceColor): number {
    const factors = this.calculateEvaluationFactors(gameState, aiColor);

    const weights = {
      material: 1.0,
      position: 0.3,
      mobility: 0.2,
      safety: 0.4,
      control: 0.1
    };

    return (
      factors.material * weights.material +
      factors.position * weights.position +
      factors.mobility * weights.mobility +
      factors.safety * weights.safety +
      factors.control * weights.control
    );
  }

  private calculateEvaluationFactors(gameState: GameState, aiColor: PieceColor): EvaluationFactors {
    const engine = new ChessEngine({ ...gameState });

    let material = 0;
    let position = 0;
    let mobility = 0;
    let safety = 0;
    let control = 0;

    // Material evaluation
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState.board[row][col];
        if (piece) {
          const value = PIECE_VALUES[piece.type];
          const multiplier = piece.color === aiColor ? 1 : -1;
          material += value * multiplier;

          // Position evaluation (piece-square tables simplified)
          const positionValue = this.getPiecePositionValue(piece, { row, col });
          position += positionValue * multiplier * 0.1;

          // Mobility evaluation
          const validMoves = engine.getValidMoves(piece);
          mobility += validMoves.length * multiplier * 0.1;
        }
      }
    }

    // King safety
    const aiKing = this.findKing(gameState, aiColor);
    const opponentKing = this.findKing(gameState, aiColor === 'white' ? 'black' : 'white');

    if (aiKing) {
      safety += this.evaluateKingSafety(gameState, aiKing, aiColor) * 10;
    }

    if (opponentKing) {
      safety -= this.evaluateKingSafety(gameState, opponentKing, aiColor === 'white' ? 'black' : 'white') * 10;
    }

    // Center control
    const centerSquares = [
      { row: 3, col: 3 }, { row: 3, col: 4 },
      { row: 4, col: 3 }, { row: 4, col: 4 }
    ];

    for (const square of centerSquares) {
      const piece = gameState.board[square.row][square.col];
      if (piece) {
        control += (piece.color === aiColor ? 1 : -1) * 0.5;
      }
    }

    return { material, position, mobility, safety, control };
  }

  private getPiecePositionValue(piece: Piece, position: Position): number {
    // Simplified piece-square tables
    const { row, col } = position;
    const centerDistance = Math.abs(3.5 - row) + Math.abs(3.5 - col);

    switch (piece.type) {
      case 'pawn':
        // Pawns advance toward promotion
        return piece.color === 'white' ? (7 - row) : row;

      case 'knight':
      case 'bishop':
        // Knights and bishops prefer center
        return 4 - centerDistance * 0.5;

      case 'rook':
        // Rooks prefer open files and ranks
        return this.isOpenFile(position, piece.color) ? 2 : 0;

      case 'queen':
        // Queens prefer center with some mobility
        return 2 - centerDistance * 0.3;

      case 'king':
        // King safety depends on game phase
        const isEndgame = this.isEndgame();
        if (isEndgame) {
          return 2 - centerDistance * 0.5; // King active in endgame
        } else {
          return centerDistance * 0.5; // King seeks safety in middlegame
        }

      default:
        return 0;
    }
  }

  private evaluateKingSafety(gameState: GameState, king: Piece, color: PieceColor): number {
    const engine = new ChessEngine({ ...gameState });

    // Basic king safety: fewer attacking pieces nearby = safer
    let safety = 0;
    const kingPos = king.position;

    // Check squares around king
    for (let deltaRow = -2; deltaRow <= 2; deltaRow++) {
      for (let deltaCol = -2; deltaCol <= 2; deltaCol++) {
        const checkPos = {
          row: kingPos.row + deltaRow,
          col: kingPos.col + deltaCol
        };

        if (this.isValidPosition(checkPos)) {
          const distance = Math.abs(deltaRow) + Math.abs(deltaCol);
          const weight = distance === 1 ? 3 : distance === 2 ? 1 : 0.5;

          if (engine.isInCheck && engine.isInCheck(color)) {
            safety -= 5; // Heavy penalty for being in check
          }

          // Penalty for exposed king
          const piece = gameState.board[checkPos.row][checkPos.col];
          if (!piece || piece.color !== color) {
            safety -= weight * 0.5;
          }
        }
      }
    }

    return safety;
  }

  private getAllPossibleMoves(gameState: GameState, color: PieceColor): Move[] {
    const engine = new ChessEngine({ ...gameState });
    const moves: Move[] = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.color === color) {
          const validMoves = engine.getValidMoves(piece);

          for (const validMove of validMoves) {
            try {
              // Create a temporary move to validate
              const move = engine.makeMove(piece, validMove.to);
              moves.push(move);

              // Undo the move (restore the game state)
              // In a real implementation, you'd want a proper undo mechanism
            } catch (error) {
              // Skip invalid moves
              continue;
            }
          }
        }
      }
    }

    return moves;
  }

  private sortMoves(moves: Move[], gameState: GameState): Move[] {
    return moves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Prioritize captures
      if (a.capturedPiece) scoreA += PIECE_VALUES[a.capturedPiece.type] * 10;
      if (b.capturedPiece) scoreB += PIECE_VALUES[b.capturedPiece.type] * 10;

      // Prioritize checks
      if (a.isCheck) scoreA += 50;
      if (b.isCheck) scoreB += 50;

      // Prioritize checkmates
      if (a.isCheckmate) scoreA += 1000;
      if (b.isCheckmate) scoreB += 1000;

      // Prioritize central moves
      const aCenterDistance = Math.abs(3.5 - a.to.row) + Math.abs(3.5 - a.to.col);
      const bCenterDistance = Math.abs(3.5 - b.to.row) + Math.abs(3.5 - b.to.col);
      scoreA -= aCenterDistance;
      scoreB -= bCenterDistance;

      return scoreB - scoreA;
    });
  }

  private makeMove(gameState: GameState, move: Move): GameState {
    // Create a deep copy of the game state
    const newGameState: GameState = JSON.parse(JSON.stringify(gameState));

    // Apply the move to the new state
    const engine = new ChessEngine(newGameState);
    engine.makeMove(move.piece, move.to);

    return engine.getGameState();
  }

  private getRandomMove(gameState: GameState, color: PieceColor): Move {
    const allMoves = this.getAllPossibleMoves(gameState, color);
    if (allMoves.length === 0) {
      throw new Error('No valid moves available');
    }

    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  private findKing(gameState: GameState, color: PieceColor): Piece | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return piece;
        }
      }
    }
    return null;
  }

  private isValidPosition(position: Position): boolean {
    return position.row >= 0 && position.row < 8 &&
           position.col >= 0 && position.col < 8;
  }

  private isOpenFile(position: Position, color: PieceColor): boolean {
    // Simplified: just check if there are fewer pieces on the file
    // In a real implementation, you'd check for truly open files
    return Math.random() > 0.5; // Placeholder
  }

  private isEndgame(): boolean {
    // Simplified endgame detection
    // In reality, you'd count material and pieces
    return Math.random() > 0.7; // Placeholder
  }

  private getThinkingTime(): number {
    // Simulate thinking time based on difficulty
    switch (this.difficulty) {
      case 'easy': return Math.random() * 500 + 200; // 200-700ms
      case 'medium': return Math.random() * 1000 + 500; // 500-1500ms
      case 'hard': return Math.random() * 2000 + 1000; // 1-3s
      case 'expert': return Math.random() * 3000 + 2000; // 2-5s
      default: return 1000;
    }
  }

  public getDifficulty(): Difficulty {
    return this.difficulty;
  }

  public setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
    this.maxDepth = this.getMaxDepth(difficulty);
  }
}
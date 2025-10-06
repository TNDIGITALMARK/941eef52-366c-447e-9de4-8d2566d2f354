import {
  Piece,
  Position,
  Move,
  GameState,
  ValidMove,
  MoveValidation,
  PieceType,
  PieceColor,
  GameStatus,
  positionToAlgebraic,
  PIECE_VALUES
} from '@/types/chess';

export class ChessEngine {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public getValidMoves(piece: Piece): ValidMove[] {
    const moves: ValidMove[] = [];

    switch (piece.type) {
      case 'pawn':
        moves.push(...this.getPawnMoves(piece));
        break;
      case 'rook':
        moves.push(...this.getRookMoves(piece));
        break;
      case 'knight':
        moves.push(...this.getKnightMoves(piece));
        break;
      case 'bishop':
        moves.push(...this.getBishopMoves(piece));
        break;
      case 'queen':
        moves.push(...this.getQueenMoves(piece));
        break;
      case 'king':
        moves.push(...this.getKingMoves(piece));
        break;
    }

    return moves.filter(move => this.wouldNotExposeKing(piece, move.to));
  }

  private getPawnMoves(pawn: Piece): ValidMove[] {
    const moves: ValidMove[] = [];
    const { row, col } = pawn.position;
    const direction = pawn.color === 'white' ? -1 : 1;
    const startRow = pawn.color === 'white' ? 6 : 1;
    const promotionRow = pawn.color === 'white' ? 0 : 7;

    // Forward move
    if (this.isValidPosition({ row: row + direction, col }) &&
        !this.getPieceAt({ row: row + direction, col })) {
      const move: ValidMove = {
        to: { row: row + direction, col },
        isCapture: false
      };

      if (row + direction === promotionRow) {
        move.promotionOptions = ['queen', 'rook', 'bishop', 'knight'];
      }
      moves.push(move);

      // Double forward move from starting position
      if (row === startRow &&
          this.isValidPosition({ row: row + 2 * direction, col }) &&
          !this.getPieceAt({ row: row + 2 * direction, col })) {
        moves.push({
          to: { row: row + 2 * direction, col },
          isCapture: false
        });
      }
    }

    // Diagonal captures
    for (const deltaCol of [-1, 1]) {
      const targetPos = { row: row + direction, col: col + deltaCol };
      if (this.isValidPosition(targetPos)) {
        const targetPiece = this.getPieceAt(targetPos);
        if (targetPiece && targetPiece.color !== pawn.color) {
          const move: ValidMove = {
            to: targetPos,
            isCapture: true
          };

          if (row + direction === promotionRow) {
            move.promotionOptions = ['queen', 'rook', 'bishop', 'knight'];
          }
          moves.push(move);
        }

        // En passant
        if (this.canEnPassant(pawn, targetPos)) {
          moves.push({
            to: targetPos,
            isCapture: true,
            isEnPassant: true
          });
        }
      }
    }

    return moves;
  }

  private getRookMoves(rook: Piece): ValidMove[] {
    const moves: ValidMove[] = [];
    const directions = [
      { row: 0, col: 1 }, { row: 0, col: -1 },
      { row: 1, col: 0 }, { row: -1, col: 0 }
    ];

    for (const direction of directions) {
      moves.push(...this.getLinearMoves(rook, direction));
    }

    return moves;
  }

  private getBishopMoves(bishop: Piece): ValidMove[] {
    const moves: ValidMove[] = [];
    const directions = [
      { row: 1, col: 1 }, { row: 1, col: -1 },
      { row: -1, col: 1 }, { row: -1, col: -1 }
    ];

    for (const direction of directions) {
      moves.push(...this.getLinearMoves(bishop, direction));
    }

    return moves;
  }

  private getQueenMoves(queen: Piece): ValidMove[] {
    return [...this.getRookMoves(queen), ...this.getBishopMoves(queen)];
  }

  private getKnightMoves(knight: Piece): ValidMove[] {
    const moves: ValidMove[] = [];
    const { row, col } = knight.position;
    const knightMoves = [
      { row: row + 2, col: col + 1 }, { row: row + 2, col: col - 1 },
      { row: row - 2, col: col + 1 }, { row: row - 2, col: col - 1 },
      { row: row + 1, col: col + 2 }, { row: row + 1, col: col - 2 },
      { row: row - 1, col: col + 2 }, { row: row - 1, col: col - 2 }
    ];

    for (const targetPos of knightMoves) {
      if (this.isValidPosition(targetPos)) {
        const targetPiece = this.getPieceAt(targetPos);
        if (!targetPiece || targetPiece.color !== knight.color) {
          moves.push({
            to: targetPos,
            isCapture: !!targetPiece
          });
        }
      }
    }

    return moves;
  }

  private getKingMoves(king: Piece): ValidMove[] {
    const moves: ValidMove[] = [];
    const { row, col } = king.position;

    // Normal king moves
    for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
      for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
        if (deltaRow === 0 && deltaCol === 0) continue;

        const targetPos = { row: row + deltaRow, col: col + deltaCol };
        if (this.isValidPosition(targetPos)) {
          const targetPiece = this.getPieceAt(targetPos);
          if (!targetPiece || targetPiece.color !== king.color) {
            if (!this.isSquareUnderAttack(targetPos, king.color)) {
              moves.push({
                to: targetPos,
                isCapture: !!targetPiece
              });
            }
          }
        }
      }
    }

    // Castling
    if (!king.hasMoved && !this.isInCheck(king.color)) {
      // Kingside castling
      const kingsideRook = this.getPieceAt({ row: king.position.row, col: 7 });
      if (kingsideRook && !kingsideRook.hasMoved &&
          this.canCastle(king, { row: king.position.row, col: 6 }, 'kingside')) {
        moves.push({
          to: { row: king.position.row, col: 6 },
          isCapture: false,
          isCastling: true
        });
      }

      // Queenside castling
      const queensideRook = this.getPieceAt({ row: king.position.row, col: 0 });
      if (queensideRook && !queensideRook.hasMoved &&
          this.canCastle(king, { row: king.position.row, col: 2 }, 'queenside')) {
        moves.push({
          to: { row: king.position.row, col: 2 },
          isCapture: false,
          isCastling: true
        });
      }
    }

    return moves;
  }

  private getLinearMoves(piece: Piece, direction: { row: number; col: number }): ValidMove[] {
    const moves: ValidMove[] = [];
    let currentPos = {
      row: piece.position.row + direction.row,
      col: piece.position.col + direction.col
    };

    while (this.isValidPosition(currentPos)) {
      const targetPiece = this.getPieceAt(currentPos);

      if (!targetPiece) {
        moves.push({
          to: { ...currentPos },
          isCapture: false
        });
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push({
            to: { ...currentPos },
            isCapture: true
          });
        }
        break; // Piece blocks further movement
      }

      currentPos = {
        row: currentPos.row + direction.row,
        col: currentPos.col + direction.col
      };
    }

    return moves;
  }

  public validateMove(piece: Piece, to: Position): MoveValidation {
    if (!this.isValidPosition(to)) {
      return { isValid: false, reason: 'Invalid position' };
    }

    const validMoves = this.getValidMoves(piece);
    const move = validMoves.find(m => m.to.row === to.row && m.to.col === to.col);

    if (!move) {
      return { isValid: false, reason: 'Illegal move for this piece' };
    }

    if (this.wouldExposeKing(piece, to)) {
      return { isValid: false, reason: 'Move would expose king to check' };
    }

    const validation: MoveValidation = { isValid: true };

    if (move.isCastling) validation.specialMove = 'castling';
    if (move.isEnPassant) validation.specialMove = 'enPassant';
    if (move.promotionOptions) validation.specialMove = 'promotion';

    return validation;
  }

  public makeMove(piece: Piece, to: Position, promotionPiece?: PieceType): Move {
    const capturedPiece = this.getPieceAt(to);
    const move: Move = {
      id: `move-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      piece: { ...piece },
      from: { ...piece.position },
      to: { ...to },
      capturedPiece: capturedPiece ? { ...capturedPiece } : undefined,
      notation: this.generateAlgebraicNotation(piece, to, capturedPiece, promotionPiece),
      timestamp: new Date(),
      isCheck: false,
      isCheckmate: false
    };

    // Update board
    this.gameState.board[piece.position.row][piece.position.col] = null;
    this.gameState.board[to.row][to.col] = {
      ...piece,
      position: to,
      hasMoved: true,
      type: promotionPiece || piece.type
    };

    // Handle special moves
    this.handleSpecialMoves(move);

    // Update captured pieces
    if (capturedPiece) {
      this.gameState.capturedPieces[capturedPiece.color].push(capturedPiece);
    }

    // Check for check/checkmate
    const opponentColor: PieceColor = this.gameState.currentPlayer === 'white' ? 'black' : 'white';
    move.isCheck = this.isInCheck(opponentColor);

    if (move.isCheck) {
      move.isCheckmate = this.isCheckmate(opponentColor);
      this.gameState.status = move.isCheckmate ? 'checkmate' : 'check';
    } else if (this.isStalemate(opponentColor)) {
      this.gameState.status = 'stalemate';
    }

    // Add move to history
    this.gameState.moves.push(move);

    // Switch players
    this.gameState.currentPlayer = opponentColor;

    return move;
  }

  private handleSpecialMoves(move: Move): void {
    // Handle castling
    if (move.piece.type === 'king' && Math.abs(move.to.col - move.from.col) === 2) {
      const isKingside = move.to.col > move.from.col;
      const rookFromCol = isKingside ? 7 : 0;
      const rookToCol = isKingside ? 5 : 3;

      const rook = this.getPieceAt({ row: move.from.row, col: rookFromCol });
      if (rook) {
        this.gameState.board[move.from.row][rookFromCol] = null;
        this.gameState.board[move.from.row][rookToCol] = {
          ...rook,
          position: { row: move.from.row, col: rookToCol },
          hasMoved: true
        };
      }
      move.isCastling = true;
    }

    // Handle en passant
    if (move.piece.type === 'pawn' && !move.capturedPiece && move.to.col !== move.from.col) {
      const capturedPawnRow = move.from.row;
      const capturedPawn = this.getPieceAt({ row: capturedPawnRow, col: move.to.col });
      if (capturedPawn) {
        this.gameState.board[capturedPawnRow][move.to.col] = null;
        this.gameState.capturedPieces[capturedPawn.color].push(capturedPawn);
        move.capturedPiece = capturedPawn;
        move.isEnPassant = true;
      }
    }
  }

  private generateAlgebraicNotation(
    piece: Piece,
    to: Position,
    capturedPiece?: Piece,
    promotionPiece?: PieceType
  ): string {
    let notation = '';

    // Special moves
    if (piece.type === 'king' && Math.abs(to.col - piece.position.col) === 2) {
      return to.col > piece.position.col ? 'O-O' : 'O-O-O';
    }

    // Piece notation
    if (piece.type !== 'pawn') {
      notation += piece.type.charAt(0).toUpperCase();
    }

    // Capture notation
    if (capturedPiece) {
      if (piece.type === 'pawn') {
        notation += positionToAlgebraic(piece.position)[0];
      }
      notation += 'x';
    }

    // Destination
    notation += positionToAlgebraic(to);

    // Promotion
    if (promotionPiece) {
      notation += '=' + promotionPiece.charAt(0).toUpperCase();
    }

    return notation;
  }

  public isInCheck(color: PieceColor): boolean {
    const king = this.findKing(color);
    return king ? this.isSquareUnderAttack(king.position, color) : false;
  }

  public isCheckmate(color: PieceColor): boolean {
    if (!this.isInCheck(color)) return false;
    return this.getAllValidMoves(color).length === 0;
  }

  public isStalemate(color: PieceColor): boolean {
    if (this.isInCheck(color)) return false;
    return this.getAllValidMoves(color).length === 0;
  }

  private getAllValidMoves(color: PieceColor): ValidMove[] {
    const pieces = this.getAllPieces(color);
    const allMoves: ValidMove[] = [];

    for (const piece of pieces) {
      allMoves.push(...this.getValidMoves(piece));
    }

    return allMoves;
  }

  private getAllPieces(color: PieceColor): Piece[] {
    const pieces: Piece[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.gameState.board[row][col];
        if (piece && piece.color === color) {
          pieces.push(piece);
        }
      }
    }
    return pieces;
  }

  private findKing(color: PieceColor): Piece | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.gameState.board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return piece;
        }
      }
    }
    return null;
  }

  private isSquareUnderAttack(position: Position, defenderColor: PieceColor): boolean {
    const attackerColor: PieceColor = defenderColor === 'white' ? 'black' : 'white';
    const attackers = this.getAllPieces(attackerColor);

    for (const attacker of attackers) {
      const moves = this.getRawMoves(attacker);
      if (moves.some(move => move.to.row === position.row && move.to.col === position.col)) {
        return true;
      }
    }

    return false;
  }

  private getRawMoves(piece: Piece): ValidMove[] {
    switch (piece.type) {
      case 'pawn': return this.getRawPawnMoves(piece);
      case 'rook': return this.getRookMoves(piece);
      case 'knight': return this.getKnightMoves(piece);
      case 'bishop': return this.getBishopMoves(piece);
      case 'queen': return this.getQueenMoves(piece);
      case 'king': return this.getRawKingMoves(piece);
      default: return [];
    }
  }

  private getRawPawnMoves(pawn: Piece): ValidMove[] {
    const moves: ValidMove[] = [];
    const { row, col } = pawn.position;
    const direction = pawn.color === 'white' ? -1 : 1;

    // Only diagonal attacks for checking purposes
    for (const deltaCol of [-1, 1]) {
      const targetPos = { row: row + direction, col: col + deltaCol };
      if (this.isValidPosition(targetPos)) {
        moves.push({
          to: targetPos,
          isCapture: true
        });
      }
    }

    return moves;
  }

  private getRawKingMoves(king: Piece): ValidMove[] {
    const moves: ValidMove[] = [];
    const { row, col } = king.position;

    for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
      for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
        if (deltaRow === 0 && deltaCol === 0) continue;

        const targetPos = { row: row + deltaRow, col: col + deltaCol };
        if (this.isValidPosition(targetPos)) {
          moves.push({
            to: targetPos,
            isCapture: false
          });
        }
      }
    }

    return moves;
  }

  private wouldNotExposeKing(piece: Piece, to: Position): boolean {
    return !this.wouldExposeKing(piece, to);
  }

  private wouldExposeKing(piece: Piece, to: Position): boolean {
    const originalPiece = this.getPieceAt(to);
    const king = this.findKing(piece.color);

    if (!king) return false;

    // Simulate move
    this.gameState.board[piece.position.row][piece.position.col] = null;
    this.gameState.board[to.row][to.col] = piece;

    // Check if king is in check after move
    const kingPos = piece.type === 'king' ? to : king.position;
    const wouldExpose = this.isSquareUnderAttack(kingPos, piece.color);

    // Restore board
    this.gameState.board[piece.position.row][piece.position.col] = piece;
    this.gameState.board[to.row][to.col] = originalPiece;

    return wouldExpose;
  }

  private canEnPassant(pawn: Piece, targetPos: Position): boolean {
    if (this.gameState.moves.length === 0) return false;

    const lastMove = this.gameState.moves[this.gameState.moves.length - 1];
    const expectedPawnPos = { row: pawn.position.row, col: targetPos.col };

    return lastMove.piece.type === 'pawn' &&
           Math.abs(lastMove.from.row - lastMove.to.row) === 2 &&
           lastMove.to.row === expectedPawnPos.row &&
           lastMove.to.col === expectedPawnPos.col;
  }

  private canCastle(king: Piece, targetPos: Position, side: 'kingside' | 'queenside'): boolean {
    const startCol = side === 'kingside' ? 5 : 1;
    const endCol = side === 'kingside' ? 6 : 3;

    // Check if squares are empty and not under attack
    for (let col = startCol; col <= endCol; col++) {
      if (this.getPieceAt({ row: king.position.row, col })) return false;
      if (this.isSquareUnderAttack({ row: king.position.row, col }, king.color)) return false;
    }

    return true;
  }

  private isValidPosition(position: Position): boolean {
    return position.row >= 0 && position.row < 8 &&
           position.col >= 0 && position.col < 8;
  }

  private getPieceAt(position: Position): Piece | null {
    if (!this.isValidPosition(position)) return null;
    return this.gameState.board[position.row][position.col];
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public evaluatePosition(): number {
    let evaluation = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.gameState.board[row][col];
        if (piece) {
          const value = PIECE_VALUES[piece.type];
          evaluation += piece.color === 'white' ? value : -value;
        }
      }
    }

    return evaluation;
  }
}
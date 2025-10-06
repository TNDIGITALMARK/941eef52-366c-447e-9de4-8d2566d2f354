'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  GameState,
  Piece,
  Position,
  Move,
  ValidMove,
  PieceColor,
  INITIAL_BOARD_STATE,
  Difficulty
} from '@/types/chess';
import { ChessEngine } from '@/lib/chess-engine';
import { ChessAI } from '@/lib/chess-ai';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { MoveHistory } from '@/components/chess/MoveHistory';
import { GameStatus } from '@/components/chess/GameStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PieceIcon } from '@/components/chess/ChessPiece';
import { cn } from '@/lib/utils';
import {
  Settings,
  Home,
  RotateCcw,
  Lightbulb,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function GamePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>(() => ({
    id: 'game-' + Date.now(),
    board: INITIAL_BOARD_STATE(),
    currentPlayer: 'white',
    status: 'active',
    moves: [],
    capturedPieces: { white: [], black: [] },
    gameSettings: {
      difficulty: 'medium',
      playerColor: 'white',
      aiColor: 'black',
      allowUndo: true,
      showHints: false
    },
    isAIGame: true,
    startTime: new Date()
  }));

  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<ValidMove[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHints, setShowHints] = useState(false);

  const engine = useMemo(() => new ChessEngine(gameState), [gameState]);
  const ai = useMemo(() => new ChessAI(gameState.gameSettings.difficulty), [gameState.gameSettings.difficulty]);

  const isPlayerTurn = gameState.currentPlayer === gameState.gameSettings.playerColor;
  const isGameActive = gameState.status === 'active' || gameState.status === 'check';

  // Game timer
  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive]);

  // AI move handling
  useEffect(() => {
    if (!isPlayerTurn && isGameActive && !isThinking) {
      handleAIMove();
    }
  }, [gameState.currentPlayer, isPlayerTurn, isGameActive, isThinking]);

  const handleAIMove = useCallback(async () => {
    if (isThinking) return;

    setIsThinking(true);
    try {
      const aiMove = await ai.getBestMove(gameState, gameState.gameSettings.aiColor);
      if (aiMove.move) {
        const newEngine = new ChessEngine(gameState);
        const move = newEngine.makeMove(aiMove.move.piece, aiMove.move.to);
        setGameState(newEngine.getGameState());

        if (soundEnabled) {
          // Play move sound
          const audio = new Audio('/sounds/move.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {}); // Ignore errors
        }
      }
    } catch (error) {
      console.error('AI move error:', error);
    } finally {
      setIsThinking(false);
    }
  }, [gameState, ai, isThinking, soundEnabled]);

  const handleSquareClick = useCallback((position: Position) => {
    if (!isPlayerTurn || !isGameActive) return;

    const piece = gameState.board[position.row][position.col];

    if (selectedPiece) {
      // Try to move the selected piece
      if (selectedPiece.position.row === position.row && selectedPiece.position.col === position.col) {
        // Clicking the same piece deselects it
        setSelectedPiece(null);
        setValidMoves([]);
        return;
      }

      // Check if this is a valid move
      const isValidMove = validMoves.some(
        move => move.to.row === position.row && move.to.col === position.col
      );

      if (isValidMove) {
        const move = engine.makeMove(selectedPiece, position);
        setGameState(engine.getGameState());
        setSelectedPiece(null);
        setValidMoves([]);

        if (soundEnabled) {
          const audio = new Audio(move.capturedPiece ? '/sounds/capture.mp3' : '/sounds/move.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        }
      } else if (piece && piece.color === gameState.gameSettings.playerColor) {
        // Select a different piece
        setSelectedPiece(piece);
        setValidMoves(engine.getValidMoves(piece));
      } else {
        // Invalid move, deselect
        setSelectedPiece(null);
        setValidMoves([]);
      }
    } else if (piece && piece.color === gameState.gameSettings.playerColor) {
      // Select a piece
      setSelectedPiece(piece);
      setValidMoves(engine.getValidMoves(piece));
    }
  }, [gameState, selectedPiece, validMoves, engine, isPlayerTurn, isGameActive, soundEnabled]);

  const handlePieceMove = useCallback((piece: Piece, to: Position) => {
    if (!isPlayerTurn || !isGameActive) return;

    const validation = engine.validateMove(piece, to);
    if (validation.isValid) {
      const move = engine.makeMove(piece, to);
      setGameState(engine.getGameState());
      setSelectedPiece(null);
      setValidMoves([]);

      if (soundEnabled) {
        const audio = new Audio(move.capturedPiece ? '/sounds/capture.mp3' : '/sounds/move.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    }
  }, [engine, isPlayerTurn, isGameActive, soundEnabled]);

  const handlePieceSelect = useCallback((piece: Piece | null) => {
    if (!isPlayerTurn || !isGameActive) return;

    setSelectedPiece(piece);
    if (piece) {
      setValidMoves(engine.getValidMoves(piece));
    } else {
      setValidMoves([]);
    }
  }, [engine, isPlayerTurn, isGameActive]);

  const handleNewGame = useCallback(() => {
    const newGameState: GameState = {
      id: 'game-' + Date.now(),
      board: INITIAL_BOARD_STATE(),
      currentPlayer: 'white',
      status: 'active',
      moves: [],
      capturedPieces: { white: [], black: [] },
      gameSettings: gameState.gameSettings,
      isAIGame: true,
      startTime: new Date()
    };

    setGameState(newGameState);
    setSelectedPiece(null);
    setValidMoves([]);
    setGameTime(0);
    setIsThinking(false);
  }, [gameState.gameSettings]);

  const handleResign = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: 'checkmate',
      endTime: new Date()
    }));
  }, []);

  const handleOfferDraw = useCallback(() => {
    // In a real game, this would send a draw offer
    // For now, just accept the draw
    setGameState(prev => ({
      ...prev,
      status: 'draw',
      endTime: new Date()
    }));
  }, []);

  const getWinner = (): PieceColor | undefined => {
    if (gameState.status === 'checkmate') {
      return gameState.currentPlayer === 'white' ? 'black' : 'white';
    }
    return undefined;
  };

  const lastMove = gameState.moves.length > 0 ? gameState.moves[gameState.moves.length - 1] : undefined;

  return (
    <div className="min-h-screen bg-chess-background">
      {/* Header */}
      <header className="bg-chess-surface border-b border-chess-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
              Chess Prime
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHints(!showHints)}
              className={cn(
                'text-chess-text-muted hover:text-chess-text-light',
                showHints && 'text-chess-highlight'
              )}
            >
              <Lightbulb className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-chess-text-muted hover:text-chess-text-light"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/setup')}
              className="text-chess-text-muted hover:text-chess-text-light"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Sidebar - Game Status */}
          <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            <GameStatus
              status={gameState.status}
              currentPlayer={gameState.currentPlayer}
              winner={getWinner()}
              playerColor={gameState.gameSettings.playerColor}
              isPlayerTurn={isPlayerTurn && !isThinking}
              moveCount={gameState.moves.length}
              timeElapsed={gameTime}
              onNewGame={handleNewGame}
              onResign={handleResign}
              onOfferDraw={handleOfferDraw}
            />

            {/* AI Status */}
            {isThinking && (
              <Card className="bg-chess-surface border-chess-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-chess-highlight border-t-transparent rounded-full animate-spin" />
                    <div>
                      <div className="text-chess-text-light font-medium">AI Thinking...</div>
                      <div className="text-sm text-chess-text-muted">
                        Analyzing position ({gameState.gameSettings.difficulty})
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Captured Pieces */}
            <Card className="bg-chess-surface border-chess-border">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-chess-text-muted mb-2 flex items-center gap-2">
                      <PieceIcon type="king" color="white" className="w-4 h-4" />
                      White Captured
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {gameState.capturedPieces.white.map((piece, index) => (
                        <PieceIcon
                          key={`${piece.id}-${index}`}
                          type={piece.type}
                          color={piece.color}
                          className="w-5 h-5"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-chess-text-muted mb-2 flex items-center gap-2">
                      <PieceIcon type="king" color="black" className="w-4 h-4" />
                      Black Captured
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {gameState.capturedPieces.black.map((piece, index) => (
                        <PieceIcon
                          key={`${piece.id}-${index}`}
                          type={piece.type}
                          color={piece.color}
                          className="w-5 h-5"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Chess Board */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <ChessBoard
              board={gameState.board}
              validMoves={showHints ? validMoves : []}
              selectedPiece={selectedPiece}
              currentPlayer={gameState.currentPlayer}
              onSquareClick={handleSquareClick}
              onPieceMove={handlePieceMove}
              onPieceSelect={handlePieceSelect}
              isFlipped={gameState.gameSettings.playerColor === 'black'}
              lastMove={lastMove ? { from: lastMove.from, to: lastMove.to } : undefined}
              isPlayerTurn={isPlayerTurn && !isThinking}
            />
          </div>

          {/* Right Sidebar - Move History */}
          <div className="lg:col-span-3 order-3">
            <MoveHistory
              moves={gameState.moves}
              gameResult={
                gameState.status === 'checkmate'
                  ? getWinner() === 'white' ? 'white-wins' : 'black-wins'
                  : gameState.status === 'draw' || gameState.status === 'stalemate'
                  ? 'draw'
                  : 'ongoing'
              }
              onExportPGN={() => {
                // Export to PGN format
                const pgn = gameState.moves.map(move => move.notation).join(' ');
                navigator.clipboard?.writeText(pgn);
              }}
              onCopyMoves={() => {
                const moves = gameState.moves.map(move => move.notation).join(' ');
                navigator.clipboard?.writeText(moves);
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
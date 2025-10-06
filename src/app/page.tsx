'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieceIcon } from '@/components/chess/ChessPiece';
import {
  Crown,
  Play,
  Settings,
  Trophy,
  Users,
  BookOpen,
  Smartphone,
  Monitor
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const features = [
    {
      icon: <PieceIcon type="queen" color="white" className="w-6 h-6" />,
      title: "Play Chess",
      description: "Experience chess reimagined with intuitive drag & drop",
      action: () => router.push('/game')
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Learn & Improve",
      description: "Master tactics with guided gameplay and analysis",
      action: () => router.push('/history')
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Challenge AI",
      description: "Test your skills against adaptive AI opponents",
      action: () => router.push('/setup')
    }
  ];

  return (
    <div className="min-h-screen bg-chess-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-chess-surface to-chess-background">
        <div className="absolute inset-0 bg-chess-background/50" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center space-y-8">
            {/* Logo and Title */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-chess-surface rounded-2xl border border-chess-border shadow-2xl">
                  <Crown className="w-12 h-12 text-chess-highlight" />
                </div>
              </div>
              <h1 className="text-5xl sm:text-7xl font-bold text-chess-text-light">
                CHESS PRIME
              </h1>
              <p className="text-xl sm:text-2xl text-chess-text-muted max-w-2xl mx-auto">
                Master the game. Anywhere, anytime.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => router.push('/game')}
                className="bg-chess-highlight hover:bg-chess-highlight/80 text-chess-background font-semibold px-8 py-4 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Play Now
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/setup')}
                className="border-chess-border text-chess-text-light hover:bg-chess-surface px-8 py-4 text-lg"
              >
                <Settings className="w-5 h-5 mr-2" />
                Customize Game
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-center pt-8">
              <div>
                <div className="text-2xl font-bold text-chess-highlight">∞</div>
                <div className="text-sm text-chess-text-muted">Games Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chess-highlight">4</div>
                <div className="text-sm text-chess-text-muted">AI Difficulties</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chess-highlight">100%</div>
                <div className="text-sm text-chess-text-muted">Free to Play</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-chess-surface/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-chess-text-light mb-4">
              Experience Chess Reimagined
            </h2>
            <p className="text-lg text-chess-text-muted max-w-2xl mx-auto">
              Discover why millions choose Chess Prime for their chess journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-chess-surface border-chess-border hover:border-chess-highlight/50 transition-all duration-300 cursor-pointer group"
                onClick={feature.action}
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-chess-highlight/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-chess-highlight/20 transition-colors">
                    <div className="text-chess-highlight">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-chess-text-light text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-chess-text-muted">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Support */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-chess-text-light mb-8">
            Play on Any Device
          </h3>
          <div className="flex justify-center items-center gap-12">
            <div className="flex items-center gap-2 text-chess-text-muted">
              <Monitor className="w-6 h-6" />
              <span>Desktop</span>
            </div>
            <div className="flex items-center gap-2 text-chess-text-muted">
              <Smartphone className="w-6 h-6" />
              <span>Mobile</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-chess-surface border-t border-chess-border py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Crown className="w-6 h-6 text-chess-highlight" />
              <span className="text-chess-text-light font-semibold">Chess Prime</span>
            </div>

            <div className="flex gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/game')}
                className="text-chess-text-muted hover:text-chess-text-light"
              >
                Play
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/setup')}
                className="text-chess-text-muted hover:text-chess-text-light"
              >
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/history')}
                className="text-chess-text-muted hover:text-chess-text-light"
              >
                History
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
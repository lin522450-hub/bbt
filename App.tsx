
import React, { useState, useEffect, useCallback } from 'react';
import PinballEngine from './components/PinballEngine';
import HUD from './components/HUD';
import OnScreenControls from './components/OnScreenControls';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    balls: 3,
    multiplier: 1,
    isGameOver: false,
    isPlaying: false,
    highScore: parseInt(localStorage.getItem('highScore') || '0', 10)
  });

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      balls: 3,
      multiplier: 1,
      isGameOver: false,
      isPlaying: true
    }));
  };

  const handleGameOver = useCallback((finalScore: number) => {
    setGameState(prev => {
      const newHighScore = Math.max(prev.highScore, finalScore);
      localStorage.setItem('highScore', newHighScore.toString());
      return {
        ...prev,
        isPlaying: false,
        isGameOver: true,
        highScore: newHighScore
      };
    });
  }, []);

  const updateScore = useCallback((points: number) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points * prev.multiplier
    }));
  }, []);

  const loseBall = useCallback(() => {
    setGameState(prev => {
      if (prev.balls <= 1) {
        handleGameOver(prev.score);
        return { ...prev, balls: 0 };
      }
      return { ...prev, balls: prev.balls - 1 };
    });
  }, [handleGameOver]);

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center bg-black overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1a1a2e_0%,_#000000_100%)] opacity-50 pointer-events-none" />
      
      {/* Decorative Stars */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute rounded-full bg-white animate-pulse" 
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's'
            }}
          />
        ))}
      </div>

      <main className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <HUD gameState={gameState} onStart={startGame} />
        
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-pink-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-[#0a0a12] rounded-lg overflow-hidden border border-white/10 shadow-2xl">
            <PinballEngine 
              isPlaying={gameState.isPlaying} 
              onScore={updateScore} 
              onBallLost={loseBall}
              onGameOver={handleGameOver}
            />
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-6 text-white/40 max-w-xs">
          <div className="p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md">
            <h3 className="font-orbitron text-xs font-bold text-blue-400 mb-2 uppercase tracking-widest">Controls</h3>
            <ul className="text-sm space-y-2">
              <li className="flex justify-between"><span>Left Flipper</span> <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-xs">Z</kbd></li>
              <li className="flex justify-between"><span>Right Flipper</span> <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-xs">M</kbd></li>
              <li className="flex justify-between"><span>Launch Ball</span> <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-xs">SPACE</kbd></li>
            </ul>
          </div>
          <div className="p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md">
            <h3 className="font-orbitron text-xs font-bold text-pink-400 mb-2 uppercase tracking-widest">Missions</h3>
            <ul className="text-xs space-y-2 italic">
              <li>• Hit the 3 pink bumpers for 300 pts!</li>
              <li>• Navigate the upper loop for 1000 pts!</li>
              <li>• Don't let the ball fall into the void.</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Visual Controls in the bottom-left */}
      <OnScreenControls />

      {/* Footer Info */}
      <footer className="absolute bottom-4 text-white/20 text-[10px] uppercase tracking-tighter">
        Modernized Space Cadet Tribute &bull; Built with React & Matter.js
      </footer>
    </div>
  );
};

export default App;

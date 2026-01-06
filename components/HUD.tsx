
import React from 'react';
import { GameState } from '../types.ts';

interface HUDProps {
  gameState: GameState;
  onStart: () => void;
}

const HUD: React.FC<HUDProps> = ({ gameState, onStart }) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[300px] text-white">
      <div className="space-y-1 text-center md:text-left">
        <h1 className="text-4xl font-orbitron font-bold tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          NEON SPACE
        </h1>
        <p className="text-blue-400/60 font-orbitron text-xs tracking-[0.3em] uppercase">Hyperdrive Pinball</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-lg">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Score</div>
          <div className="text-4xl font-orbitron text-white neon-text-blue tabular-nums">
            {gameState.score.toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-lg">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Balls</div>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    i < gameState.balls ? 'bg-blue-400 shadow-[0_0_10px_#00d4ff]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-lg">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">HI-Score</div>
            <div className="text-xl font-orbitron text-pink-400 tabular-nums">
              {gameState.highScore.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {!gameState.isPlaying && (
        <button
          onClick={onStart}
          className="group relative px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-orbitron text-lg transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          {gameState.isGameOver ? 'RETRY MISSION' : 'LAUNCH MISSION'}
        </button>
      )}

      {gameState.isGameOver && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
          <div className="text-red-400 font-orbitron text-sm mb-1 uppercase tracking-widest">Mission Terminated</div>
          <div className="text-xs text-white/40">The ball has entered the event horizon.</div>
        </div>
      )}
    </div>
  );
};

export default HUD;

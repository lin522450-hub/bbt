
import React, { useState, useEffect } from 'react';

interface ControlButtonProps {
  label: string;
  sublabel: string;
  keyCode: string;
  color: 'blue' | 'pink' | 'purple';
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ label, sublabel, keyCode, color, className }) => {
  const [isActive, setIsActive] = useState(false);

  const handlePress = () => {
    setIsActive(true);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: keyCode }));
  };

  const handleRelease = () => {
    setIsActive(false);
  };

  // Sync with actual keyboard presses
  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      if (e.code === keyCode) setIsActive(true);
    };
    const upHandler = (e: KeyboardEvent) => {
      if (e.code === keyCode) setIsActive(false);
    };
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [keyCode]);

  const colorClasses = {
    blue: 'border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(0,212,255,0.3)] bg-blue-500/10',
    pink: 'border-pink-500 text-pink-400 shadow-[0_0_15px_rgba(255,0,255,0.3)] bg-pink-500/10',
    purple: 'border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(157,0,255,0.3)] bg-purple-500/10',
  };

  const activeClasses = {
    blue: 'scale-95 bg-blue-500/40 shadow-[0_0_25px_#00d4ff]',
    pink: 'scale-95 bg-pink-500/40 shadow-[0_0_25px_#ff00ff]',
    purple: 'scale-95 bg-purple-500/40 shadow-[0_0_25px_#9d00ff]',
  };

  return (
    <button
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={handleRelease}
      onTouchStart={(e) => { e.preventDefault(); handlePress(); }}
      onTouchEnd={(e) => { e.preventDefault(); handleRelease(); }}
      className={`
        ${className}
        w-16 h-16 rounded-2xl border-2 backdrop-blur-md transition-all duration-75 flex flex-col items-center justify-center
        ${colorClasses[color]}
        ${isActive ? activeClasses[color] : ''}
      `}
    >
      <span className="font-orbitron text-xl font-bold leading-none">{label}</span>
      <span className="text-[8px] uppercase tracking-tighter opacity-60 mt-1">{sublabel}</span>
    </button>
  );
};

const OnScreenControls: React.FC = () => {
  return (
    <div className="absolute bottom-10 left-10 z-50 flex flex-col gap-4 pointer-events-none">
      <div className="flex gap-4 pointer-events-auto">
        <ControlButton label="L" sublabel="Flipper [Z]" keyCode="KeyZ" color="blue" />
        <ControlButton label="R" sublabel="Flipper [M]" keyCode="KeyM" color="pink" />
      </div>
      <div className="pointer-events-auto">
        <ControlButton 
          label="LAUNCH" 
          sublabel="Spacebar" 
          keyCode="Space" 
          color="purple" 
          className="w-full h-12"
        />
      </div>
      
      {/* Decorative text */}
      <div className="mt-2 flex items-center gap-2 opacity-30">
        <div className="h-px w-8 bg-white/50" />
        <span className="text-[10px] uppercase font-orbitron tracking-widest text-white">Manual Overide</span>
      </div>
    </div>
  );
};

export default OnScreenControls;

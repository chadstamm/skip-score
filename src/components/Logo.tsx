import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export const Logo = ({ className = "", variant = "default" }: LogoProps) => {
  const isWhite = variant === 'white';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* The "Split Triangle" Concept */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 drop-shadow-md"
        >
          {/* Skip Segment */}
          <path
            d="M4 18V6L12 12L4 18Z"
            fill={isWhite ? "white" : "#F97316"}
          />
          {/* Score Segment */}
          <path
            d="M14 6L21 12L14 18V6Z"
            fill={isWhite ? "rgba(255,255,255,0.7)" : "#0D9488"}
          />
          {/* Vertical Separator Line */}
          <rect x="12" y="5" width="1.5" height="14" rx="0.75" fill={isWhite ? "rgba(255,255,255,0.3)" : "white"} fillOpacity="0.5" />
        </svg>
      </div>
      <span className={`text-3xl font-black tracking-tighter ${isWhite ? 'text-white' : ''}`}>
        <span className={isWhite ? 'text-white' : 'text-score-teal'}>SKIP</span>
        <span className={isWhite ? 'text-white/70' : 'text-skip-coral'}>SCORE</span>
      </span>
    </div>
  );
};

export default Logo;

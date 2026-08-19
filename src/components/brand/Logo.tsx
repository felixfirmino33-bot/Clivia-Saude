import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  showSlogan?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  showSlogan = false,
  size = 'md',
  variant = 'dark',
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', sub: 'text-[10px]' },
    md: { icon: 38, text: 'text-xl', sub: 'text-xs' },
    lg: { icon: 48, text: 'text-2xl', sub: 'text-sm' },
    xl: { icon: 64, text: 'text-3xl', sub: 'text-base' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`} id="clivia-brand-logo">
      {/* Clívia Pin + Cross SVG Icon */}
      <div 
        style={{ width: currentSize.icon, height: currentSize.icon }} 
        className="relative shrink-0 flex items-center justify-center filter drop-shadow-sm"
      >
        <svg
          viewBox="0 0 200 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="pinGrad" x1="20" y1="20" x2="180" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0088FF" />
              <stop offset="50%" stopColor="#0066D6" />
              <stop offset="100%" stopColor="#004FB8" />
            </linearGradient>
            <radialGradient id="vortexGrad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#0099FF" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#005CBF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#003D8F" stopOpacity="0.95" />
            </radialGradient>
          </defs>

          {/* Main Teardrop / Map Pin */}
          <path
            d="M100 235 C100 235 15 155 15 95 C15 45 53 10 100 10 C147 10 185 45 185 95 C185 155 100 235 100 235 Z"
            fill="url(#pinGrad)"
          />

          {/* Swirling Vortex Petals */}
          <g opacity="0.45" stroke="#FFFFFF" strokeWidth="2.5" fill="none">
            <path d="M100 45 C125 45 150 70 150 95 C150 120 120 145 100 145" />
            <path d="M50 95 C50 70 75 45 100 45 C125 45 145 75 145 100" />
            <path d="M100 145 C75 145 55 125 55 95 C55 65 85 50 100 50" />
          </g>

          {/* Center Orb */}
          <circle cx="100" cy="95" r="38" fill="url(#vortexGrad)" stroke="#38BDF8" strokeWidth="2" />

          {/* White Medical Cross */}
          <path
            d="M93 72 H107 V88 H123 V102 H107 V118 H93 V102 H77 V88 H93 V72 Z"
            fill="#FFFFFF"
            className="filter drop-shadow-sm"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span 
            className={`font-extrabold tracking-tight font-['Outfit',sans-serif] ${currentSize.text} ${
              variant === 'light' ? 'text-white' : 'text-[#0c3931]'
            }`}
          >
            Clívia Saúde
          </span>
          {showSlogan && (
            <span 
              className={`font-medium tracking-wide ${currentSize.sub} ${
                variant === 'light' ? 'text-teal-100/90' : 'text-teal-700/90'
              }`}
            >
              Encontre a saúde que precisa
            </span>
          )}
        </div>
      )}
    </div>
  );
};

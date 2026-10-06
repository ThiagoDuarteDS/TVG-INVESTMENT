import React from 'react';

export const LOGO_URL = 'https://i.postimg.cc/mDXbWhCR/639D805C-80D1-43AC-942D-39DCA66B9589.png';
export const WHITE_LOGO_SRC = '/tvg-logo-white.png';

interface TVGLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'login';
  className?: string;
  alt?: string;
}

export const TVGLogo: React.FC<TVGLogoProps> = ({
  size = 'md',
  className = '',
  alt = 'TVG INVESTMENT',
}) => {
  // Sizing definitions preserving the 1280x698 aspect ratio without distortion
  // Login size is prominent, grand, perfectly legible and centered (Requirements 1, 3, 4 & 5)
  const sizeClasses = {
    sm: 'w-28 sm:w-36 h-auto max-h-10',
    md: 'w-44 sm:w-56 h-auto max-h-14',
    lg: 'w-56 sm:w-72 h-auto max-h-20',
    xl: 'w-64 sm:w-80 h-auto max-h-28',
    hero: 'w-72 sm:w-96 md:w-[420px] h-auto max-h-36 sm:max-h-44',
    login: 'w-72 sm:w-96 md:w-[440px] max-w-full h-auto max-h-32 sm:max-h-40',
  };

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      {/* 
        Logo oficial TVG INVESTMENT na cor branca, preservando proporções originais
        sem qualquer quadrado branco, card branco ou moldura artificial atrás.
        Integrada diretamente ao fundo.
      */}
      <img
        src={WHITE_LOGO_SRC}
        alt={alt}
        className={`object-contain transition-all duration-300 ${sizeClasses[size]} drop-shadow-[0_4px_24px_rgba(255,255,255,0.20)]`}
        onError={(e) => {
          // Fallback to official postimg URL inverted to white if offline/local issue
          const target = e.currentTarget as HTMLImageElement;
          target.src = LOGO_URL;
          target.style.filter = 'brightness(0) invert(1) drop-shadow(0 4px 20px rgba(255,255,255,0.25))';
        }}
      />
    </div>
  );
};

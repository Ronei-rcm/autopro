import { useState, useEffect } from 'react';

export interface Breakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallMobile: boolean;
  width: number;
}

/**
 * Hook para detectar tamanho da tela e breakpoints responsivos
 */
export const useResponsive = (): Breakpoints => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width,
    isSmallMobile: width < 480,      // Mobile pequeno (< 480px)
    isMobile: width < 768,            // Mobile (< 768px)
    isTablet: width >= 768 && width < 1024, // Tablet (768px - 1023px)
    isDesktop: width >= 1024,         // Desktop (>= 1024px)
  };
};

/**
 * Hook para detectar orientação do dispositivo
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return orientation;
};


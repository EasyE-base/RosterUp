/**
 * useParallax Hook
 * Provides parallax scrolling effect for background images/elements
 */

import { useEffect, useState } from 'react';

export interface ParallaxOptions {
  speed?: number; // Parallax speed multiplier (0.1 = slow, 1 = normal, 2 = fast)
  disabled?: boolean; // Disable parallax (useful for mobile)
}

export function useParallax(options: ParallaxOptions = {}) {
  const { speed = 0.5, disabled = false } = options;
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setOffset(scrollY * speed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initialize on mount

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, disabled]);

  return {
    offset,
    style: {
      transform: `translateY(${offset}px)`,
    },
  };
}

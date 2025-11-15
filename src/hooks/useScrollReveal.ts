/**
 * useScrollReveal Hook
 * Provides scroll-triggered fade-in animations for sections
 */

import { useEffect, useRef, useState } from 'react';

export interface ScrollRevealOptions {
  threshold?: number; // Intersection observer threshold (0-1)
  rootMargin?: string; // Root margin for early/late triggering
  once?: boolean; // Only animate once
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px', once = true } = options;
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}

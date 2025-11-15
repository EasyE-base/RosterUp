/**
 * useCountUp Hook
 * Animates numbers counting up when they become visible
 */

import { useEffect, useRef, useState } from 'react';

export interface CountUpOptions {
  end: number; // Target number
  start?: number; // Starting number (default 0)
  duration?: number; // Animation duration in ms
  decimals?: number; // Number of decimal places
  separator?: string; // Thousands separator (e.g., ',')
  prefix?: string; // Prefix (e.g., '$')
  suffix?: string; // Suffix (e.g., '+', '%')
  threshold?: number; // Intersection observer threshold
}

export function useCountUp(options: CountUpOptions) {
  const {
    end,
    start = 0,
    duration = 2000,
    decimals = 0,
    separator = ',',
    prefix = '',
    suffix = '',
    threshold = 0.5,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [count, setCount] = useState(start);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = Date.now();
          const range = end - start;

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + range * easeOut;

            setCount(current);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(animate);
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [end, start, duration, threshold, hasAnimated]);

  // Format the number with separators and affixes
  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    const decimalPart = parts[1] ? `.${parts[1]}` : '';

    return `${prefix}${integerPart}${decimalPart}${suffix}`;
  };

  return {
    ref,
    value: count,
    formattedValue: formatNumber(count),
  };
}

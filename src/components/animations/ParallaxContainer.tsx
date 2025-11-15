/**
 * ParallaxContainer Component
 * Provides parallax scroll effect for background elements
 */

import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

export interface ParallaxContainerProps {
  children: ReactNode;
  speed?: number; // Parallax speed (-1 to 1, negative for reverse)
  className?: string;
}

export default function ParallaxContainer({
  children,
  speed = 0.5,
  className,
}: ParallaxContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Track scroll progress relative to the element
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Transform scroll progress into y position
  // Adjust range based on speed (e.g., speed=0.5 moves half as fast as scroll)
  const y = useTransform(scrollYProgress, [0, 1], [-100 * speed, 100 * speed]);

  return (
    <div ref={ref} className={className} style={{ position: 'relative' }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

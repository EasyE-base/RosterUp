/**
 * ScrollReveal Component
 * Wraps children with scroll-triggered fade-in animation using Framer Motion
 */

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

export interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number; // Delay in seconds
  duration?: number; // Duration in seconds
  once?: boolean; // Only animate once
  amount?: number; // Threshold (0-1)
  className?: string;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.2,
  className,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  // Define initial and animate positions based on direction
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1], // Custom easing
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

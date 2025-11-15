import { ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

interface ConfettiButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'success' | 'celebration' | 'custom';
  disabled?: boolean;
  confettiOptions?: confetti.Options;
}

export default function ConfettiButton({
  children,
  onClick,
  className = '',
  variant = 'default',
  disabled = false,
  confettiOptions,
}: ConfettiButtonProps) {
  const triggerConfetti = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    const variants = {
      default: {
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
      },
      success: {
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
        ticks: 200,
      },
      celebration: {
        particleCount: 150,
        spread: 120,
        origin: { x, y },
        colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#10b981', '#3b82f6', '#8b5cf6'],
        gravity: 1.2,
        ticks: 300,
        startVelocity: 45,
      },
      custom: confettiOptions || {},
    };

    const options = variants[variant];

    // Fire confetti
    confetti(options);

    // For celebration variant, fire multiple bursts
    if (variant === 'celebration') {
      setTimeout(() => {
        confetti({
          ...options,
          particleCount: 100,
          angle: 60,
          spread: 55,
        });
      }, 100);
      setTimeout(() => {
        confetti({
          ...options,
          particleCount: 100,
          angle: 120,
          spread: 55,
        });
      }, 200);
    }

    onClick?.();
  };

  return (
    <motion.button
      onClick={triggerConfetti}
      disabled={disabled}
      className={className}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}

// Utility function to trigger confetti programmatically
export const fireConfetti = (variant: 'default' | 'success' | 'celebration' = 'default', customOptions?: confetti.Options) => {
  const variants = {
    default: {
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
    },
    success: {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#6ee7b7'],
      ticks: 200,
    },
    celebration: {
      particleCount: 150,
      spread: 120,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#10b981', '#3b82f6', '#8b5cf6'],
      gravity: 1.2,
      ticks: 300,
      startVelocity: 45,
    },
  };

  const options = customOptions || variants[variant];

  // Fire main burst
  confetti(options);

  // For celebration, fire multiple bursts
  if (variant === 'celebration') {
    setTimeout(() => {
      confetti({
        ...options,
        particleCount: 100,
        angle: 60,
        spread: 55,
      });
    }, 100);
    setTimeout(() => {
      confetti({
        ...options,
        particleCount: 100,
        angle: 120,
        spread: 55,
      });
    }, 200);
  }
};

// Fireworks effect for major milestones
export const fireFireworks = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: NodeJS.Timeout = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#10b981', '#34d399', '#6ee7b7'],
    });
  }, 250);
};

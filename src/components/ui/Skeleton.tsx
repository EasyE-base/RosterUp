import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'wave',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const baseClass = `bg-slate-800 ${variantClasses[variant]} ${className}`;

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  };

  if (animation === 'none') {
    return <div className={baseClass} style={style} />;
  }

  if (animation === 'pulse') {
    return (
      <motion.div
        className={baseClass}
        style={style}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    );
  }

  // Wave animation (default)
  return (
    <div className={`relative overflow-hidden ${baseClass}`} style={style}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// Skeleton Card Component
export function SkeletonCard({ children }: { children?: ReactNode }) {
  return (
    <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/50">
      {children}
    </div>
  );
}

// Skeleton Text Lines
export function SkeletonText({ lines = 3, spacing = 'normal' }: { lines?: number; spacing?: 'tight' | 'normal' | 'relaxed' }) {
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-3',
    relaxed: 'space-y-4',
  };

  return (
    <div className={spacingClasses[spacing]}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height="1rem"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
}

// Skeleton Avatar
export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return <Skeleton variant="circular" className={sizes[size]} />;
}

// Skeleton Image
export function SkeletonImage({ aspectRatio = 'video' }: { aspectRatio?: 'square' | 'video' | 'portrait' }) {
  const aspects = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  return <Skeleton variant="rounded" className={`w-full ${aspects[aspectRatio]}`} />;
}

// Skeleton Table
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} height="2rem" variant="rounded" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} height="1.5rem" variant="rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Skeleton List
export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonAvatar size="md" />
          <div className="flex-1 space-y-2">
            <Skeleton height="1rem" width="60%" />
            <Skeleton height="0.75rem" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton Section Card (for marketplace)
export function SkeletonSectionCard() {
  return (
    <SkeletonCard>
      <div className="space-y-3">
        <SkeletonImage aspectRatio="video" />
        <div className="space-y-2">
          <Skeleton height="1.25rem" width="80%" />
          <Skeleton height="0.875rem" width="100%" />
          <Skeleton height="0.875rem" width="60%" />
        </div>
        <div className="flex gap-2 mt-4">
          <Skeleton height="2rem" width="5rem" variant="rounded" />
          <Skeleton height="2rem" width="5rem" variant="rounded" />
        </div>
      </div>
    </SkeletonCard>
  );
}

// Skeleton Grid (for marketplace grid)
export function SkeletonGrid({ items = 6, columns = 3 }: { items?: number; columns?: number }) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonSectionCard key={i} />
      ))}
    </div>
  );
}

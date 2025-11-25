import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { appleAnimations } from '@/lib/appleDesignTokens';

export interface AppleStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Stat title/label
   */
  label: string;

  /**
   * Stat value (number or string)
   */
  value: string | number;

  /**
   * Icon to display
   */
  icon: React.ReactNode;

  /**
   * Icon background color
   * @default 'blue'
   */
  iconColor?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan' | 'gray';

  /**
   * Size variant
   * @default 'default'
   */
  size?: 'default' | 'compact';

  /**
   * Optional trend indicator
   */
  trend?: {
    value: string;
    isPositive: boolean;
  };

  /**
   * Optional subtitle/description
   */
  subtitle?: string;

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Animate on view
   */
  animateOnView?: boolean;

  /**
   * Animation delay
   */
  delay?: number;
}

export const AppleStatCard = React.forwardRef<HTMLDivElement, AppleStatCardProps>(
  (
    {
      label,
      value,
      icon,
      iconColor = 'blue',
      size = 'default',
      trend,
      subtitle,
      onClick,
      animateOnView = false,
      delay = 0,
      className,
      ...props
    },
    ref
  ) => {
    const isCompact = size === 'compact';
    // Icon background colors
    const iconColorStyles = {
      blue: 'bg-gradient-to-br from-blue-500 to-cyan-400',
      green: 'bg-gradient-to-br from-green-500 to-emerald-400',
      yellow: 'bg-gradient-to-br from-yellow-500 to-orange-400',
      red: 'bg-gradient-to-br from-red-500 to-pink-400',
      purple: 'bg-gradient-to-br from-purple-500 to-pink-400',
      cyan: 'bg-gradient-to-br from-cyan-500 to-blue-400',
      gray: 'bg-gradient-to-br from-slate-600 to-slate-400',
    };

    // Animation props
    const animationProps = animateOnView
      ? {
          initial: { opacity: 0, y: 12 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: {
            duration: 0.6,
            ease: appleAnimations.easing.easeOutExpo,
            delay,
          },
        }
      : {};

    const hoverProps = onClick ? appleAnimations.hoverLift : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          // Base styles
          'bg-white border-[1.5px] border-slate-200/60 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-300',
          // Size-based padding
          isCompact ? 'p-4' : 'p-6',
          // Click styles
          onClick && 'cursor-pointer hover:border-slate-300/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
          className
        )}
        onClick={onClick}
        {...animationProps}
        {...(onClick && hoverProps)}
        {...props}
      >
        <div className="flex items-start justify-between">
          {/* Content */}
          <div className="flex-1">
            <p className={cn(
              'font-medium text-[rgb(134,142,150)]',
              isCompact ? 'text-xs mb-1' : 'text-sm mb-2'
            )}>{label}</p>
            <div className="flex items-baseline gap-2">
              <p className={cn(
                'font-semibold text-[rgb(29,29,31)] tracking-tight',
                isCompact ? 'text-xl' : 'text-4xl'
              )}>{value}</p>
              {trend && (
                <span
                  className={cn(
                    'font-medium',
                    isCompact ? 'text-xs' : 'text-sm',
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
              )}
            </div>
            {subtitle && <p className={cn(
              'text-[rgb(134,142,150)]',
              isCompact ? 'text-xs mt-0.5' : 'text-sm mt-1'
            )}>{subtitle}</p>}
          </div>

          {/* Icon Badge */}
          <div
            className={cn(
              'rounded-xl flex items-center justify-center text-white shadow-lg',
              isCompact ? 'w-10 h-10' : 'w-14 h-14 rounded-2xl',
              iconColorStyles[iconColor]
            )}
          >
            {icon}
          </div>
        </div>
      </motion.div>
    );
  }
);

AppleStatCard.displayName = 'AppleStatCard';

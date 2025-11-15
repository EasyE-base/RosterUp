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
          'bg-white border-[1.5px] border-slate-200/60 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-300',
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
            <p className="text-sm font-medium text-[rgb(134,142,150)] mb-2">{label}</p>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-semibold text-[rgb(29,29,31)] tracking-tight">{value}</p>
              {trend && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
              )}
            </div>
            {subtitle && <p className="text-sm text-[rgb(134,142,150)] mt-1">{subtitle}</p>}
          </div>

          {/* Icon Badge */}
          <div
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg',
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

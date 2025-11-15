import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AppleButton } from './AppleButton';
import { appleAnimations } from '@/lib/appleDesignTokens';

export interface AppleEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icon to display
   */
  icon: React.ReactNode;

  /**
   * Title text
   */
  title: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * Primary action button
   */
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };

  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Icon color
   * @default 'gray'
   */
  iconColor?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';

  /**
   * Animate on view
   */
  animateOnView?: boolean;
}

export const AppleEmptyState = React.forwardRef<HTMLDivElement, AppleEmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      secondaryAction,
      iconColor = 'gray',
      animateOnView = true,
      className,
      ...props
    },
    ref
  ) => {
    // Icon colors
    const iconColorStyles = {
      blue: 'text-[rgb(0,113,227)]',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      red: 'text-red-600',
      purple: 'text-purple-600',
      gray: 'text-[rgb(134,142,150)]',
    };

    // Animation props
    const animationProps = animateOnView
      ? {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: {
            duration: 0.6,
            ease: appleAnimations.easing.easeOutExpo,
          },
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center py-16 px-6',
          className
        )}
        {...animationProps}
        {...props}
      >
        {/* Icon */}
        <div className={cn('mb-6 opacity-40', iconColorStyles[iconColor])}>{icon}</div>

        {/* Title */}
        <h3 className="text-2xl font-semibold text-[rgb(29,29,31)] mb-2 tracking-tight">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-base text-[rgb(134,142,150)] max-w-md mb-8 leading-relaxed">
            {description}
          </p>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex items-center gap-3">
            {action && (
              <AppleButton
                variant="primary"
                onClick={action.onClick}
                leftIcon={action.icon}
              >
                {action.label}
              </AppleButton>
            )}
            {secondaryAction && (
              <AppleButton variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </AppleButton>
            )}
          </div>
        )}
      </motion.div>
    );
  }
);

AppleEmptyState.displayName = 'AppleEmptyState';

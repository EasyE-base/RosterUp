import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { appleShadows, appleAnimations } from '@/lib/appleDesignTokens';

export interface AppleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant
   * @default 'default'
   */
  variant?: 'default' | 'elevated' | 'feature' | 'stat';

  /**
   * Padding size
   * @default 'lg'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Enable hover lift effect
   * @default true
   */
  hover?: boolean;

  /**
   * Make card clickable
   */
  onClick?: () => void;

  /**
   * Add animation on view
   */
  animateOnView?: boolean;

  /**
   * Custom border color
   */
  borderColor?: string;
}

export const AppleCard = React.forwardRef<HTMLDivElement, AppleCardProps>(
  (
    {
      variant = 'default',
      padding = 'lg',
      hover = true,
      onClick,
      animateOnView = false,
      borderColor,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variantStyles = {
      default: 'bg-white border-[1.5px] border-slate-200/60',
      elevated: `bg-white border-[1.5px] border-slate-200/60 shadow-[${appleShadows.card}]`,
      feature: 'bg-gradient-to-br from-white to-slate-50/50 border-[1.5px] border-slate-200/60',
      stat: 'bg-white border-[1.5px] border-slate-200/80',
    };

    // Padding styles
    const paddingStyles = {
      none: '',
      sm: 'p-6',
      md: 'p-8',
      lg: 'p-10',
      xl: 'p-12',
    };

    // Hover styles
    const hoverStyles = hover
      ? `hover:border-slate-300/80 hover:shadow-[${appleShadows.cardHover}] transition-all duration-500`
      : '';

    // Click styles
    const clickStyles = onClick ? 'cursor-pointer' : '';

    // Animation props
    const animationProps = animateOnView
      ? {
          initial: { opacity: 0, y: 12 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.6, ease: appleAnimations.easing.easeOutExpo },
        }
      : {};

    const hoverProps = hover && onClick ? appleAnimations.hoverLift : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-2xl overflow-hidden',
          // Variant
          variantStyles[variant],
          // Padding
          paddingStyles[padding],
          // Hover
          hoverStyles,
          // Click
          clickStyles,
          // Custom border
          borderColor && `border-${borderColor}`,
          className
        )}
        onClick={onClick}
        {...animationProps}
        {...(hover && hoverProps)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AppleCard.displayName = 'AppleCard';

// Compound Components
export const AppleCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('mb-6', className)} {...props}>
    {children}
  </div>
));

AppleCardHeader.displayName = 'AppleCardHeader';

export const AppleCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-3xl font-semibold tracking-[-0.01em] text-[rgb(29,29,31)]', className)}
    {...props}
  >
    {children}
  </h3>
));

AppleCardTitle.displayName = 'AppleCardTitle';

export const AppleCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-lg text-[rgb(86,88,105)] leading-relaxed mt-2', className)}
    {...props}
  >
    {children}
  </p>
));

AppleCardDescription.displayName = 'AppleCardDescription';

export const AppleCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props}>
    {children}
  </div>
));

AppleCardContent.displayName = 'AppleCardContent';

export const AppleCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('mt-6 flex items-center gap-4', className)} {...props}>
    {children}
  </div>
));

AppleCardFooter.displayName = 'AppleCardFooter';

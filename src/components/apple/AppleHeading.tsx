import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { appleTypography, appleAnimations } from '@/lib/appleDesignTokens';

export interface AppleHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading level (h1-h6)
   * @default 'h2'
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * Predefined size based on Landing page hierarchy
   * @default 'section'
   */
  size?: 'hero' | 'section' | 'card' | 'feature' | 'body';

  /**
   * Font weight
   * @default 600
   */
  weight?: 400 | 500 | 600 | 700;

  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Text color variant
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'tertiary';

  /**
   * Animate on view
   */
  animateOnView?: boolean;

  /**
   * Animation delay (in seconds)
   */
  delay?: number;

  /**
   * Use gradient text effect
   */
  gradient?: boolean;

  /**
   * Custom gradient colors
   */
  gradientColors?: string;
}

export const AppleHeading = React.forwardRef<HTMLHeadingElement, AppleHeadingProps>(
  (
    {
      level = 2,
      size = 'section',
      weight = 600,
      align = 'left',
      color = 'primary',
      animateOnView = false,
      delay = 0,
      gradient = false,
      gradientColors = 'from-blue-600 via-blue-500 to-cyan-500',
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Size-based styles matching Landing page
    const sizeStyles = {
      hero: `text-[96px] leading-[1.05] tracking-[-0.04em]`,
      section: `text-[56px] leading-[1.1] tracking-[-0.02em]`,
      card: `text-3xl leading-[1.2] tracking-[-0.01em]`,
      feature: `text-xl leading-[1.3]`,
      body: `text-lg leading-[1.5]`,
    };

    // Weight styles
    const weightStyles = {
      400: 'font-normal',
      500: 'font-medium',
      600: 'font-semibold',
      700: 'font-bold',
    };

    // Alignment styles
    const alignStyles = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    // Color styles
    const colorStyles = {
      primary: 'text-[rgb(29,29,31)]',
      secondary: 'text-[rgb(86,88,105)]',
      tertiary: 'text-[rgb(134,142,150)]',
    };

    // Gradient styles
    const gradientStyle = gradient
      ? `bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`
      : '';

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

    // Render the appropriate heading level
    const Component = motion[`h${level}` as keyof typeof motion] as any;

    return (
      <Component
        ref={ref}
        className={cn(
          // Base styles
          'font-["-apple-system","BlinkMacSystemFont","SF_Pro_Display","Segoe_UI","Roboto","sans-serif"]',
          // Size
          sizeStyles[size],
          // Weight
          weightStyles[weight],
          // Alignment
          alignStyles[align],
          // Color (only if not gradient)
          !gradient && colorStyles[color],
          // Gradient
          gradientStyle,
          className
        )}
        {...animationProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

AppleHeading.displayName = 'AppleHeading';

// Convenience components for common use cases
export const AppleHeroHeading = React.forwardRef<
  HTMLHeadingElement,
  Omit<AppleHeadingProps, 'level' | 'size'>
>((props, ref) => <AppleHeading ref={ref} level={1} size="hero" {...props} />);

AppleHeroHeading.displayName = 'AppleHeroHeading';

export const AppleSectionHeading = React.forwardRef<
  HTMLHeadingElement,
  Omit<AppleHeadingProps, 'level' | 'size'>
>((props, ref) => <AppleHeading ref={ref} level={2} size="section" {...props} />);

AppleSectionHeading.displayName = 'AppleSectionHeading';

export const AppleCardHeading = React.forwardRef<
  HTMLHeadingElement,
  Omit<AppleHeadingProps, 'level' | 'size'>
>((props, ref) => <AppleHeading ref={ref} level={3} size="card" {...props} />);

AppleCardHeading.displayName = 'AppleCardHeading';

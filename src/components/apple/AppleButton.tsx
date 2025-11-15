import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { appleColors, appleAnimations } from '@/lib/appleDesignTokens';

export interface AppleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'text' | 'gradient' | 'outline';

  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Border radius style
   * @default 'full'
   */
  rounded?: 'full' | 'lg';

  /**
   * Full width button
   */
  fullWidth?: boolean;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Icon to display before text
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display after text
   */
  rightIcon?: React.ReactNode;

  /**
   * Convert to Link wrapper
   */
  asChild?: boolean;
}

export const AppleButton = React.forwardRef<HTMLButtonElement, AppleButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      rounded = 'full',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variantStyles = {
      primary: `bg-[${appleColors.primary}] text-white hover:bg-[${appleColors.primaryHover}] hover:shadow-lg`,
      secondary: `bg-[${appleColors.textPrimary}] text-white hover:bg-[rgb(51,51,51)] hover:shadow-lg`,
      gradient: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:from-blue-600 hover:to-cyan-500',
      outline: `border-2 border-[${appleColors.primary}] text-[${appleColors.primary}] hover:bg-[${appleColors.primary}] hover:text-white`,
      text: `text-[${appleColors.primary}] hover:text-[${appleColors.primaryHover}] bg-transparent`,
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-5 py-2.5 text-sm',
      md: 'px-8 py-3.5 text-base',
      lg: 'px-10 py-4 text-lg',
    };

    // Rounded styles
    const roundedStyles = {
      full: 'rounded-full',
      lg: 'rounded-lg',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // Rounded
          roundedStyles[rounded],
          // Full width
          fullWidth && 'w-full',
          // Disabled
          (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
          // Text variant specific
          variant === 'text' && 'hover:bg-transparent px-4',
          className
        )}
        whileTap={appleAnimations.activePress.whileTap}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </motion.button>
    );
  }
);

AppleButton.displayName = 'AppleButton';

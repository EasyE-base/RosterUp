import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { motionVariants, colors } from '../../lib/designTokens';
import RippleEffect from './RippleEffect';

interface ButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'brand';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  ripple?: boolean;
}

/**
 * Premium Button component with Webflow-inspired styling
 *
 * Features:
 * - Multiple variants (primary, secondary, outline, ghost, brand)
 * - Size options (sm, md, lg, xl)
 * - Ripple effect on click
 * - Smooth hover animations
 * - Icon support
 * - Disabled state
 */
export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  type = 'button',
  icon,
  iconPosition = 'left',
  ripple = true,
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const variantClasses = {
    primary: `
      bg-blue-600 text-white border-2 border-blue-600
      hover:bg-blue-700 hover:border-blue-700
      active:bg-blue-800
      disabled:bg-slate-300 disabled:border-slate-300 disabled:cursor-not-allowed
    `,
    secondary: `
      bg-slate-800 text-white border-2 border-slate-800
      hover:bg-slate-900 hover:border-slate-900
      active:bg-black
      disabled:bg-slate-300 disabled:border-slate-300 disabled:cursor-not-allowed
    `,
    outline: `
      bg-transparent text-slate-900 border-2 border-slate-300
      hover:border-slate-900 hover:bg-slate-50
      active:bg-slate-100
      disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
    `,
    ghost: `
      bg-transparent text-slate-700 border-2 border-transparent
      hover:bg-slate-100 hover:text-slate-900
      active:bg-slate-200
      disabled:text-slate-400 disabled:cursor-not-allowed
    `,
    brand: `
      bg-gradient-to-r from-${colors.brand.primary} to-${colors.brand.primaryDark}
      text-white border-2 border-transparent
      hover:shadow-lg hover:shadow-red-500/30
      active:scale-95
      disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed
      font-bold
    `,
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    rounded-xl font-semibold
    transition-all duration-200
    focus:outline-none focus:ring-4 focus:ring-blue-500/20
    ${fullWidth ? 'w-full' : ''}
  `;

  const ButtonContent = () => (
    <>
      {icon && iconPosition === 'left' && (
        <span className="inline-flex">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="inline-flex">{icon}</span>
      )}
    </>
  );

  if (ripple && !disabled) {
    return (
      <RippleEffect
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
        onClick={onClick}
        disabled={disabled}
      >
        <ButtonContent />
      </RippleEffect>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      variants={motionVariants.buttonHover}
      initial="rest"
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
    >
      <ButtonContent />
    </motion.button>
  );
}

/**
 * Button Group component for arranging multiple buttons
 */
interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
}

export function ButtonGroup({
  children,
  className = '',
  orientation = 'horizontal',
  spacing = 'md',
}: ButtonGroupProps) {
  const spacingClasses = {
    sm: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
    md: orientation === 'horizontal' ? 'gap-4' : 'gap-4',
    lg: orientation === 'horizontal' ? 'gap-6' : 'gap-6',
  };

  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  };

  return (
    <div className={`
      flex ${orientationClasses[orientation]} ${spacingClasses[spacing]} ${className}
    `}>
      {children}
    </div>
  );
}

/**
 * Icon Button component (square button with just an icon)
 */
interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  ariaLabel: string;
}

export function IconButton({
  icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  ariaLabel,
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-slate-800 text-white hover:bg-slate-900',
    outline: 'bg-transparent text-slate-700 border-2 border-slate-300 hover:border-slate-900',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center justify-center
        rounded-xl transition-all duration-200
        focus:outline-none focus:ring-4 focus:ring-blue-500/20
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.1 } : undefined}
      whileTap={!disabled ? { scale: 0.9 } : undefined}
    >
      {icon}
    </motion.button>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';

export interface AppleBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge variant
   * @default 'default'
   */
  variant?:
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'purple'
    | 'outline';

  /**
   * Badge size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Dot indicator
   */
  dot?: boolean;

  /**
   * Icon to display before text
   */
  icon?: React.ReactNode;
}

export const AppleBadge = React.forwardRef<HTMLSpanElement, AppleBadgeProps>(
  ({ variant = 'default', size = 'md', dot = false, icon, className, children, ...props }, ref) => {
    // Variant styles
    const variantStyles = {
      default: 'bg-slate-100 text-[rgb(86,88,105)] border-slate-200',
      primary: 'bg-blue-50 text-[rgb(0,113,227)] border-blue-200',
      success: 'bg-green-50 text-green-700 border-green-200',
      warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      danger: 'bg-red-50 text-red-700 border-red-200',
      info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      outline: 'bg-transparent text-[rgb(86,88,105)] border-slate-300',
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };

    // Dot color based on variant
    const dotColors = {
      default: 'bg-slate-400',
      primary: 'bg-[rgb(0,113,227)]',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      info: 'bg-cyan-500',
      purple: 'bg-purple-500',
      outline: 'bg-slate-400',
    };

    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center gap-1.5 rounded-full border font-medium font-["-apple-system","BlinkMacSystemFont","SF_Pro_Display","Segoe_UI","Roboto","sans-serif"] transition-all duration-200',
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {/* Dot indicator */}
        {dot && <span className={cn('w-2 h-2 rounded-full', dotColors[variant])} />}

        {/* Icon */}
        {icon && <span className="flex items-center">{icon}</span>}

        {/* Content */}
        {children}
      </span>
    );
  }
);

AppleBadge.displayName = 'AppleBadge';

// Convenience components for common use cases
export const AppleStatusBadge = React.forwardRef<
  HTMLSpanElement,
  Omit<AppleBadgeProps, 'variant'> & { status: 'active' | 'pending' | 'accepted' | 'rejected' | 'closed' | 'open' }
>(({ status, ...props }, ref) => {
  const variantMap = {
    active: 'success' as const,
    open: 'success' as const,
    pending: 'warning' as const,
    accepted: 'success' as const,
    rejected: 'danger' as const,
    closed: 'default' as const,
  };

  return <AppleBadge ref={ref} variant={variantMap[status]} dot {...props} />;
});

AppleStatusBadge.displayName = 'AppleStatusBadge';

export const AppleSportBadge = React.forwardRef<HTMLSpanElement, Omit<AppleBadgeProps, 'variant'>>(
  (props, ref) => {
    return <AppleBadge ref={ref} variant="primary" {...props} />;
  }
);

AppleSportBadge.displayName = 'AppleSportBadge';

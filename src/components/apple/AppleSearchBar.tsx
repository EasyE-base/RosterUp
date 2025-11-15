import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AppleSearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Search bar size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Show clear button when value exists
   * @default true
   */
  showClearButton?: boolean;

  /**
   * Callback when clear button is clicked
   */
  onClear?: () => void;

  /**
   * Full width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Container className
   */
  containerClassName?: string;
}

export const AppleSearchBar = React.forwardRef<HTMLInputElement, AppleSearchBarProps>(
  (
    {
      size = 'md',
      showClearButton = true,
      onClear,
      fullWidth = false,
      containerClassName,
      className,
      value,
      onChange,
      placeholder = 'Search...',
      ...props
    },
    ref
  ) => {
    // Size styles
    const sizeStyles = {
      sm: 'h-10 pl-10 pr-10 text-sm',
      md: 'h-12 pl-11 pr-11 text-base',
      lg: 'h-14 pl-12 pr-12 text-lg',
    };

    const iconSizeStyles = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const iconPositionStyles = {
      sm: 'left-3',
      md: 'left-4',
      lg: 'left-4',
    };

    const clearButtonPositionStyles = {
      sm: 'right-3',
      md: 'right-4',
      lg: 'right-4',
    };

    const hasValue = value && String(value).length > 0;

    return (
      <div className={cn('relative', fullWidth && 'w-full', containerClassName)}>
        {/* Search Icon */}
        <Search
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-[rgb(134,142,150)] pointer-events-none',
            iconPositionStyles[size],
            iconSizeStyles[size]
          )}
        />

        {/* Input */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            // Base styles
            'w-full rounded-lg border-[1.5px] bg-white font-["-apple-system","BlinkMacSystemFont","SF_Pro_Display","Segoe_UI","Roboto","sans-serif"] transition-all duration-200',
            // Size
            sizeStyles[size],
            // Border and focus
            'border-slate-200 focus:border-[rgb(0,113,227)] focus:ring-[rgb(0,113,227)]',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            // Placeholder
            'placeholder:text-[rgb(134,142,150)]',
            // Override autofill
            'autofill:bg-white autofill:shadow-[inset_0_0_0_1000px_rgb(255,255,255)]',
            className
          )}
          style={{
            WebkitBoxShadow: '0 0 0 1000px white inset',
            WebkitTextFillColor: 'rgb(29,29,31)',
          } as React.CSSProperties}
          {...props}
        />

        {/* Clear Button */}
        {showClearButton && hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-[rgb(134,142,150)] hover:text-[rgb(86,88,105)] transition-colors p-1 rounded-full hover:bg-slate-100',
              clearButtonPositionStyles[size]
            )}
            aria-label="Clear search"
          >
            <X className={iconSizeStyles[size]} />
          </button>
        )}
      </div>
    );
  }
);

AppleSearchBar.displayName = 'AppleSearchBar';

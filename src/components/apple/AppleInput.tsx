import React from 'react';
import { cn } from '@/lib/utils';
import { appleColors } from '@/lib/appleDesignTokens';

export interface AppleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Input size
   * @default 'md'
   */
  inputSize?: 'sm' | 'md' | 'lg';

  /**
   * Error state
   */
  error?: boolean;

  /**
   * Error message
   */
  errorMessage?: string;

  /**
   * Label text
   */
  label?: string;

  /**
   * Helper text
   */
  helperText?: string;

  /**
   * Left icon
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon
   */
  rightIcon?: React.ReactNode;

  /**
   * Full width
   */
  fullWidth?: boolean;
}

export const AppleInput = React.forwardRef<HTMLInputElement, AppleInputProps>(
  (
    {
      inputSize = 'md',
      error = false,
      errorMessage,
      label,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(134,142,150)]">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              // Base styles
              'w-full rounded-lg border-[1.5px] bg-white font-["-apple-system","BlinkMacSystemFont","SF_Pro_Display","Segoe_UI","Roboto","sans-serif"] transition-all duration-200',
              // Size
              sizeStyles[inputSize],
              // Border color
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-200 focus:border-[rgb(0,113,227)] focus:ring-[rgb(0,113,227)]',
              // Focus
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              // Icons padding
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              // Disabled
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
              // Placeholder
              'placeholder:text-[rgb(134,142,150)]',
              className
            )}
            style={{
              WebkitBoxShadow: '0 0 0 1000px white inset',
              WebkitTextFillColor: 'rgb(29,29,31)',
            } as React.CSSProperties}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(134,142,150)]">
              {rightIcon}
            </div>
          )}
        </div>

        {(errorMessage || helperText) && (
          <p
            className={cn(
              'mt-2 text-sm',
              error ? 'text-red-500' : 'text-[rgb(134,142,150)]'
            )}
          >
            {error ? errorMessage : helperText}
          </p>
        )}
      </div>
    );
  }
);

AppleInput.displayName = 'AppleInput';

// Textarea variant
export interface AppleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  inputSize?: 'sm' | 'md' | 'lg';
  error?: boolean;
  errorMessage?: string;
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
  rows?: number;
}

export const AppleTextarea = React.forwardRef<HTMLTextAreaElement, AppleTextareaProps>(
  (
    {
      inputSize = 'md',
      error = false,
      errorMessage,
      label,
      helperText,
      fullWidth = false,
      rows = 4,
      className,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'w-full rounded-lg border-[1.5px] bg-white font-["-apple-system","BlinkMacSystemFont","SF_Pro_Display","Segoe_UI","Roboto","sans-serif"] transition-all duration-200 resize-y',
            sizeStyles[inputSize],
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-200 focus:border-[rgb(0,113,227)] focus:ring-[rgb(0,113,227)]',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
            'placeholder:text-[rgb(134,142,150)]',
            className
          )}
          {...props}
        />

        {(errorMessage || helperText) && (
          <p
            className={cn(
              'mt-2 text-sm',
              error ? 'text-red-500' : 'text-[rgb(134,142,150)]'
            )}
          >
            {error ? errorMessage : helperText}
          </p>
        )}
      </div>
    );
  }
);

AppleTextarea.displayName = 'AppleTextarea';

// Select variant
export interface AppleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  inputSize?: 'sm' | 'md' | 'lg';
  error?: boolean;
  errorMessage?: string;
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

export const AppleSelect = React.forwardRef<HTMLSelectElement, AppleSelectProps>(
  (
    {
      inputSize = 'md',
      error = false,
      errorMessage,
      label,
      helperText,
      fullWidth = false,
      options,
      className,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
            {label}
          </label>
        )}

        <select
          ref={ref}
          className={cn(
            'w-full rounded-lg border-[1.5px] bg-white font-["-apple-system","BlinkMacSystemFont","SF_Pro_Display","Segoe_UI","Roboto","sans-serif"] transition-all duration-200 appearance-none',
            sizeStyles[inputSize],
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-200 focus:border-[rgb(0,113,227)] focus:ring-[rgb(0,113,227)]',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
            'pr-10', // Space for dropdown arrow
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown arrow */}
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(134,142,150)]">
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {(errorMessage || helperText) && (
          <p
            className={cn(
              'mt-2 text-sm',
              error ? 'text-red-500' : 'text-[rgb(134,142,150)]'
            )}
          >
            {error ? errorMessage : helperText}
          </p>
        )}
      </div>
    );
  }
);

AppleSelect.displayName = 'AppleSelect';

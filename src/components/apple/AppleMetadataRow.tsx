import React from 'react';
import { cn } from '@/lib/utils';

export interface AppleMetadataRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icon to display
   */
  icon: React.ReactNode;

  /**
   * Label text (optional - can use value only)
   */
  label?: string;

  /**
   * Value/content
   */
  value: React.ReactNode;

  /**
   * Icon color
   * @default 'gray'
   */
  iconColor?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';

  /**
   * Size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Vertical layout (icon/label stacked)
   */
  vertical?: boolean;
}

export const AppleMetadataRow = React.forwardRef<HTMLDivElement, AppleMetadataRowProps>(
  (
    {
      icon,
      label,
      value,
      iconColor = 'gray',
      size = 'md',
      vertical = false,
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

    // Size styles
    const sizeConfig = {
      sm: {
        icon: 'w-4 h-4',
        label: 'text-xs',
        value: 'text-sm',
        gap: 'gap-2',
      },
      md: {
        icon: 'w-5 h-5',
        label: 'text-sm',
        value: 'text-base',
        gap: 'gap-3',
      },
      lg: {
        icon: 'w-6 h-6',
        label: 'text-base',
        value: 'text-lg',
        gap: 'gap-4',
      },
    };

    const config = sizeConfig[size];

    if (vertical) {
      return (
        <div
          ref={ref}
          className={cn('flex flex-col items-center text-center', config.gap, className)}
          {...props}
        >
          {/* Icon */}
          <div className={cn(iconColorStyles[iconColor], config.icon)}>{icon}</div>

          {/* Label & Value */}
          <div className="flex flex-col gap-1">
            {label && (
              <span className={cn('font-medium text-[rgb(134,142,150)]', config.label)}>
                {label}
              </span>
            )}
            <span className={cn('font-medium text-[rgb(29,29,31)]', config.value)}>
              {value}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center', config.gap, className)}
        {...props}
      >
        {/* Icon */}
        <div className={cn('flex-shrink-0', iconColorStyles[iconColor], config.icon)}>
          {icon}
        </div>

        {/* Label & Value */}
        <div className="flex-1 min-w-0">
          {label && (
            <span className={cn('text-[rgb(134,142,150)]', config.label)}>{label}: </span>
          )}
          <span className={cn('text-[rgb(29,29,31)] font-medium', config.value)}>
            {value}
          </span>
        </div>
      </div>
    );
  }
);

AppleMetadataRow.displayName = 'AppleMetadataRow';

// Convenience component for simple icon + text (no label)
export const AppleIconText = React.forwardRef<
  HTMLDivElement,
  Omit<AppleMetadataRowProps, 'label'>
>(({ icon, value, ...props }, ref) => {
  return <AppleMetadataRow ref={ref} icon={icon} value={value} {...props} />;
});

AppleIconText.displayName = 'AppleIconText';

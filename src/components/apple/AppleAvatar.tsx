import React from 'react';
import { cn } from '@/lib/utils';

export interface AppleAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Image URL
   */
  src?: string | null;

  /**
   * Alt text for image
   */
  alt?: string;

  /**
   * Name to generate initials from (fallback when no image)
   */
  name?: string;

  /**
   * Avatar size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  /**
   * Shape
   * @default 'circle'
   */
  shape?: 'circle' | 'square';

  /**
   * Background color for initials
   * @default 'blue'
   */
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan' | 'gray';

  /**
   * Show border
   */
  border?: boolean;
}

export const AppleAvatar = React.forwardRef<HTMLDivElement, AppleAvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = 'md',
      shape = 'circle',
      color = 'blue',
      border = false,
      className,
      ...props
    },
    ref
  ) => {
    // Get initials from name
    const getInitials = (name?: string) => {
      if (!name) return '?';
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    };

    // Size styles
    const sizeStyles = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
      '2xl': 'w-20 h-20 text-2xl',
    };

    // Shape styles
    const shapeStyles = {
      circle: 'rounded-full',
      square: 'rounded-lg',
    };

    // Color styles (for initials fallback)
    const colorStyles = {
      blue: 'bg-gradient-to-br from-blue-500 to-cyan-400',
      green: 'bg-gradient-to-br from-green-500 to-emerald-400',
      yellow: 'bg-gradient-to-br from-yellow-500 to-orange-400',
      red: 'bg-gradient-to-br from-red-500 to-pink-400',
      purple: 'bg-gradient-to-br from-purple-500 to-pink-400',
      cyan: 'bg-gradient-to-br from-cyan-500 to-blue-400',
      gray: 'bg-gradient-to-br from-slate-600 to-slate-400',
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'flex items-center justify-center overflow-hidden font-medium text-white font-["-apple-system","BlinkMacSystemFont","SF_Pro_Display","Segoe_UI","Roboto","sans-serif"]',
          // Size
          sizeStyles[size],
          // Shape
          shapeStyles[shape],
          // Border
          border && 'ring-2 ring-white shadow-md',
          // If no image, use color
          !src && colorStyles[color],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
    );
  }
);

AppleAvatar.displayName = 'AppleAvatar';

// Avatar Group Component
export interface AppleAvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum number of avatars to show
   * @default 3
   */
  max?: number;

  /**
   * Avatar size
   */
  size?: AppleAvatarProps['size'];

  /**
   * Children (AppleAvatar components)
   */
  children: React.ReactNode;
}

export const AppleAvatarGroup = React.forwardRef<HTMLDivElement, AppleAvatarGroupProps>(
  ({ max = 3, size = 'md', children, className, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    return (
      <div ref={ref} className={cn('flex items-center', className)} {...props}>
        <div className="flex -space-x-2">
          {visibleChildren}
          {remainingCount > 0 && (
            <AppleAvatar
              size={size}
              name={`+${remainingCount}`}
              color="gray"
              border
            />
          )}
        </div>
      </div>
    );
  }
);

AppleAvatarGroup.displayName = 'AppleAvatarGroup';

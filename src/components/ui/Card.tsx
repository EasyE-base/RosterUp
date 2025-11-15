import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { motionVariants } from '../../lib/designTokens';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  imageZoom?: boolean;
  variant?: 'default' | 'elevated' | 'outline' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Premium Card component with Webflow-inspired hover effects
 *
 * Features:
 * - 3D lift effect on hover
 * - Image zoom on parent hover
 * - Multiple variants (elevated, outline, ghost)
 * - Customizable padding
 * - Smooth animations with spring physics
 */
export default function Card({
  children,
  className = '',
  onClick,
  hover = true,
  imageZoom = false,
  variant = 'default',
  padding = 'md',
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  const variantClasses = {
    default: 'bg-white border border-slate-200',
    elevated: 'bg-white shadow-lg',
    outline: 'bg-transparent border-2 border-slate-300',
    ghost: 'bg-slate-50/50 border border-slate-100',
  };

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={`
        relative rounded-2xl overflow-hidden transition-all duration-300
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      initial="rest"
      whileHover={hover ? "hover" : undefined}
      variants={hover ? motionVariants.cardHover : undefined}
      style={{
        transformStyle: imageZoom ? 'preserve-3d' : undefined,
      }}
    >
      {children}
    </Component>
  );
}

/**
 * Card Image component with zoom effect
 * Use inside Card with imageZoom={true}
 */
interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
  overlay?: ReactNode;
}

export function CardImage({
  src,
  alt,
  className = '',
  aspectRatio = 'auto',
  overlay,
}: CardImageProps) {
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  return (
    <div className={`relative overflow-hidden ${aspectClasses[aspectRatio]} ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        variants={motionVariants.imageZoom}
      />
      {overlay && (
        <div className="absolute inset-0">
          {overlay}
        </div>
      )}
    </div>
  );
}

/**
 * Card Header component
 */
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card Title component
 */
interface CardTitleProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function CardTitle({ children, className = '', size = 'md' }: CardTitleProps) {
  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold',
    xl: 'text-3xl font-bold',
  };

  return (
    <h3 className={`${sizeClasses[size]} text-slate-900 ${className}`}>
      {children}
    </h3>
  );
}

/**
 * Card Description component
 */
interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-slate-600 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

/**
 * Card Footer component
 */
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-6 flex items-center gap-4 ${className}`}>
      {children}
    </div>
  );
}

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { appleAnimations } from '@/lib/appleDesignTokens';

export interface AppleModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Callback when modal should close
   */
  onClose: () => void;

  /**
   * Modal title
   */
  title?: string;

  /**
   * Modal description
   */
  description?: string;

  /**
   * Modal size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Children content
   */
  children: React.ReactNode;

  /**
   * Footer content (usually buttons)
   */
  footer?: React.ReactNode;

  /**
   * Close on backdrop click
   * @default true
   */
  closeOnBackdrop?: boolean;

  /**
   * Close on escape key
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Hide close button
   */
  hideCloseButton?: boolean;

  /**
   * Custom className for modal content
   */
  className?: string;
}

export const AppleModal: React.FC<AppleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnBackdrop = true,
  closeOnEscape = true,
  hideCloseButton = false,
  className,
}) => {
  // Size styles
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4',
  };

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.3,
                ease: appleAnimations.easing.easeOutExpo,
              }}
              className={cn(
                // Base styles
                'relative w-full bg-white rounded-2xl shadow-2xl pointer-events-auto max-h-[90vh] flex flex-col',
                // Size
                sizeStyles[size],
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || !hideCloseButton) && (
                <div className="flex items-start justify-between p-6 border-b border-slate-200">
                  <div className="flex-1">
                    {title && (
                      <h2 className="text-2xl font-semibold text-[rgb(29,29,31)] tracking-tight">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-[rgb(134,142,150)]">{description}</p>
                    )}
                  </div>

                  {!hideCloseButton && (
                    <button
                      onClick={onClose}
                      className="ml-4 text-[rgb(134,142,150)] hover:text-[rgb(86,88,105)] transition-colors p-1 rounded-lg hover:bg-slate-100"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50/50">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

AppleModal.displayName = 'AppleModal';

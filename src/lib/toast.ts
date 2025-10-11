import toast from 'react-hot-toast';

/**
 * Toast notification utilities
 * Centralized configuration and helper functions for toast notifications
 */

// Default toast options
export const toastConfig = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    background: '#1e293b',
    color: '#f1f5f9',
    border: '1px solid #334155',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#f1f5f9',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#f1f5f9',
    },
  },
};

// Custom toast functions with consistent styling
export const showToast = {
  success: (message: string) =>
    toast.success(message, {
      ...toastConfig,
      duration: 3000,
    }),

  error: (message: string) =>
    toast.error(message, {
      ...toastConfig,
      duration: 5000,
    }),

  info: (message: string) =>
    toast(message, {
      ...toastConfig,
      icon: '💡',
    }),

  warning: (message: string) =>
    toast(message, {
      ...toastConfig,
      icon: '⚠️',
      duration: 4000,
    }),

  loading: (message: string) =>
    toast.loading(message, {
      ...toastConfig,
    }),

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) =>
    toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      toastConfig
    ),

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};

/**
 * Error handler that shows appropriate toast messages
 */
export function handleError(error: unknown, fallbackMessage = 'An error occurred') {
  console.error('Error:', error);

  let message = fallbackMessage;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  }

  showToast.error(message);
  return message;
}

/**
 * Async operation wrapper with automatic error handling
 */
export async function withToast<T>(
  operation: () => Promise<T>,
  messages?: {
    loading?: string;
    success?: string;
    error?: string;
  }
): Promise<T | null> {
  const defaultMessages = {
    loading: 'Loading...',
    success: 'Success!',
    error: 'Operation failed',
  };

  const msgs = { ...defaultMessages, ...messages };

  try {
    if (msgs.loading) {
      const loadingToast = showToast.loading(msgs.loading);
      const result = await operation();
      toast.dismiss(loadingToast);
      if (msgs.success) {
        showToast.success(msgs.success);
      }
      return result;
    } else {
      const result = await operation();
      if (msgs.success) {
        showToast.success(msgs.success);
      }
      return result;
    }
  } catch (error) {
    handleError(error, msgs.error);
    return null;
  }
}
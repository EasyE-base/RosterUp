import toast, { Toaster, Toast as ToastType } from 'react-hot-toast';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom toast component with beautiful styling
export const CustomToast = ({ t, message, type }: { t: ToastType; message: string; type: 'success' | 'error' | 'info' | 'warning' }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  };

  const colors = {
    success: 'border-green-400/20 bg-green-400/10',
    error: 'border-red-400/20 bg-red-400/10',
    info: 'border-blue-400/20 bg-blue-400/10',
    warning: 'border-yellow-400/20 bg-yellow-400/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
      className={`
        flex items-center gap-3 p-4 pr-6 rounded-xl
        backdrop-blur-xl bg-slate-900/90 border ${colors[type]}
        shadow-2xl max-w-md
      `}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="text-sm font-medium text-white flex-1">{message}</p>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// Toast provider component to be added to app root
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    />
  );
}

// Convenient toast functions with beautiful styling
export const showToast = {
  success: (message: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) => {
    if (options?.action) {
      toast.custom(
        (t) => (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
            className="flex items-center gap-3 p-4 rounded-xl backdrop-blur-xl bg-slate-900/90 border border-green-400/20 bg-green-400/10 shadow-2xl max-w-md"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-sm font-medium text-white flex-1">{message}</p>
            <button
              onClick={() => {
                options.action!.onClick();
                toast.dismiss(t.id);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-green-400 hover:text-green-300 border border-green-400/30 rounded-lg hover:bg-green-400/10 transition-colors"
            >
              {options.action.label}
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-shrink-0 text-slate-400 hover:text-white transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ),
        { duration: options.duration || 5000 }
      );
    } else {
      toast.custom((t) => <CustomToast t={t} message={message} type="success" />, {
        duration: options?.duration || 3000,
      });
    }
  },

  error: (message: string, options?: { duration?: number }) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="error" />, {
      duration: options?.duration || 4000,
    });
  },

  info: (message: string, options?: { duration?: number }) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="info" />, {
      duration: options?.duration || 3000,
    });
  },

  warning: (message: string, options?: { duration?: number }) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="warning" />, {
      duration: options?.duration || 4000,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    }
  ) => {
    toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
        success: {
          duration: 3000,
          icon: '✅',
        },
        error: {
          duration: 4000,
          icon: '❌',
        },
      }
    );
  },
};

// Loading toast with custom styling
export const showLoadingToast = (message: string) => {
  return toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
        className="flex items-center gap-3 p-4 rounded-xl backdrop-blur-xl bg-slate-900/90 border border-blue-400/20 bg-blue-400/10 shadow-2xl max-w-md"
      >
        <div className="flex-shrink-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"
          />
        </div>
        <p className="text-sm font-medium text-white flex-1">{message}</p>
      </motion.div>
    ),
    { duration: Infinity }
  );
};

export default showToast;

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  undoAction?: () => void;
  undoLabel?: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  showSuccess: (title: string, message?: string) => string;
  showError: (title: string, message?: string) => string;
  showUndoToast: (title: string, onUndo: () => void, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ duration = 4000, ...rest }: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      const newToast: ToastItem = { ...rest, id, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      return addToast({ type: 'success', title, message, duration: 3500 });
    },
    [addToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      return addToast({ type: 'error', title, message, duration: 5000 });
    },
    [addToast]
  );

  const showUndoToast = useCallback(
    (title: string, onUndo: () => void, duration: number = 5000) => {
      return addToast({
        type: 'info',
        title,
        undoAction: onUndo,
        undoLabel: 'Undo',
        duration,
      });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showUndoToast,
      }}
    >
      {children}
      {/* Toast viewport container at bottom-right */}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
        role="region"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto bg-white rounded-xl border border-[#E3EAF2] shadow-popover p-3.5 flex items-start gap-3"
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && (
                  <CheckCircle2 className="w-5 h-5 text-[#12B8A6]" />
                )}
                {toast.type === 'error' && (
                  <AlertCircle className="w-5 h-5 text-[#E5484D]" />
                )}
                {toast.type === 'info' && (
                  <Info className="w-5 h-5 text-[#1C7FDB]" />
                )}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <p className="text-sm font-semibold text-[#0A2358] leading-tight">
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="text-xs text-[#5F7088] mt-0.5 leading-normal">
                    {toast.message}
                  </p>
                )}
                {toast.undoAction && (
                  <button
                    onClick={() => {
                      toast.undoAction?.();
                      removeToast(toast.id);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#1C7FDB] bg-[#EAF3FD] hover:bg-[#D5E7FA] rounded-md transition-colors"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    {toast.undoLabel || 'Undo'}
                  </button>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 text-[#5F7088] hover:text-[#0A2358] rounded-md transition-colors hover:bg-slate-100"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

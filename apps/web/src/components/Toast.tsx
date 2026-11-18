import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: ToastAction;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-success bg-success-light text-success-dark',
  error: 'border-danger bg-danger-light text-danger-dark',
  info: 'border-primary-300 bg-primary-50 text-primary-900',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = nextId.current;
      nextId.current += 1;
      setToasts((current) => [...current, { ...options, id }]);

      const duration = options.duration ?? 5000;
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 sm:left-auto sm:w-full sm:max-w-sm"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-lg border px-4 py-3 shadow-lg ${
              variantStyles[item.variant ?? 'info']
            }`}
            role={item.variant === 'error' ? 'alert' : 'status'}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                {item.description ? <p className="mt-1 text-sm">{item.description}</p> : null}
              </div>
              <button
                type="button"
                className="text-sm font-medium underline"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
              >
                Close
              </button>
            </div>
            {item.action ? (
              <button
                type="button"
                className="mt-2 text-sm font-medium underline"
                onClick={() => {
                  item.action?.onClick();
                  dismiss(item.id);
                }}
              >
                {item.action.label}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingLabel?: string;
  children?: ReactNode;
}

const styles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-600 disabled:bg-ink-200 disabled:text-ink-500',
  secondary:
    'border border-ink-300 bg-surface text-ink-900 hover:bg-ink-100 disabled:border-ink-200 disabled:bg-ink-50 disabled:text-ink-400',
  danger: 'bg-danger text-white hover:bg-danger-dark disabled:bg-ink-200 disabled:text-ink-500',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    className = '',
    loading = false,
    loadingLabel,
    disabled,
    children,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className="h-4 w-4" />
          <span>{loadingLabel ?? 'Working...'}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});

import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const styles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-600 disabled:bg-primary-300',
  secondary: 'border border-ink-300 bg-surface text-ink-900 hover:bg-ink-100',
  danger: 'bg-danger text-white hover:bg-danger-dark',
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-[44px] items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

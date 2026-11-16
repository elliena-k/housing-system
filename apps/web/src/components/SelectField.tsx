import type { ReactNode, SelectHTMLAttributes } from 'react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: ReactNode;
}

export function SelectField({
  label,
  error,
  id,
  name,
  children,
  className = '',
  ...props
}: SelectFieldProps) {
  const inputId = id ?? name;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-ink-700" htmlFor={inputId}>
        {label}
      </label>
      <select
        id={inputId}
        name={name}
        className={`min-h-[44px] w-full rounded-md border border-ink-300 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

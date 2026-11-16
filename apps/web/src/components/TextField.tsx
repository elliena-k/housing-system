import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, id, name, className = '', ...props }: TextFieldProps) {
  const inputId = id ?? name;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-ink-700" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={`min-h-[44px] w-full rounded-md border border-ink-300 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary ${className}`}
        {...props}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

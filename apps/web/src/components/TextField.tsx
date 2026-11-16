import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, id, name, className = '', ...props }: TextFieldProps) {
  const inputId = id ?? name;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${className}`}
        {...props}
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

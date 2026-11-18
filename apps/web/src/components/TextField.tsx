import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

type Requirement = 'required' | 'optional' | 'none';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  requirement?: Requirement;
  trailing?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, requirement = 'none', trailing, id, name, className = '', ...props },
  ref
) {
  const inputId = id ?? name;
  const describedBy =
    [hint ? `${inputId}-hint` : null, error ? `${inputId}-error` : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1 text-sm font-medium text-ink-700" htmlFor={inputId}>
        <span>{label}</span>
        {requirement === 'required' ? (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
        {requirement === 'optional' ? (
          <span className="text-xs font-normal text-ink-500">(optional)</span>
        ) : null}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          name={name}
          aria-invalid={Boolean(error)}
          aria-required={requirement === 'required'}
          aria-describedby={describedBy}
          className={`min-h-[44px] w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400 ${
            error ? 'border-danger' : 'border-ink-300'
          } ${trailing ? 'pr-12' : ''} ${className}`}
          {...props}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>
        ) : null}
      </div>
      {hint ? (
        <p className="text-xs text-ink-500" id={`${inputId}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-danger" id={`${inputId}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});

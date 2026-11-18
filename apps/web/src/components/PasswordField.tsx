import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { TextField } from './TextField';

type Requirement = 'required' | 'optional' | 'none';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  hint?: string;
  requirement?: Requirement;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ label, error, hint, requirement, id, name, disabled, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? name;

    return (
      <TextField
        {...props}
        ref={ref}
        id={id}
        name={name}
        disabled={disabled}
        label={label}
        error={error}
        hint={hint}
        requirement={requirement}
        type={visible ? 'text' : 'password'}
        trailing={
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-500 transition hover:bg-ink-100 hover:text-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:cursor-not-allowed disabled:text-ink-300"
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            aria-controls={inputId}
            disabled={disabled}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3l18 18M10.58 10.58A3 3 0 0013.42 13.42M9.88 5.09A10.94 10.94 0 0112 4.9c5.05 0 9.27 3.11 10.5 7.1a11.8 11.8 0 01-2.2 3.45M6.23 6.23A11.8 11.8 0 001.5 12c1.23 3.99 5.45 7.1 10.5 7.1 1.7 0 3.3-.35 4.73-.97"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12c1.23-3.99 5.45-7.1 10.5-7.1s9.27 3.11 10.5 7.1c-1.23 3.99-5.45 7.1-10.5 7.1S3.48 15.99 2.25 12z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        }
      />
    );
  }
);

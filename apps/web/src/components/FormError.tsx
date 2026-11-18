import { Link } from 'react-router-dom';
import { Spinner } from './Spinner';

const codeActions: Record<string, { label: string; to: string }> = {
  UNAUTHENTICATED: { label: 'Sign in again', to: '/login' },
  PROFILE_INCOMPLETE: { label: 'Complete your profile', to: '/student/profile' },
  PROFILE_MISSING: { label: 'Complete your profile', to: '/student/profile' },
  APPLICATION_EXISTS: { label: 'View your application', to: '/student/application' },
  ALREADY_ALLOCATED: { label: 'View your dashboard', to: '/student' },
  MATRIC_TAKEN: { label: 'Sign in instead', to: '/login' },
  EMAIL_TAKEN: { label: 'Sign in instead', to: '/login' },
};

interface FormErrorProps {
  message?: string | null;
  code?: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export function FormError({ message, code, onRetry, retrying = false }: FormErrorProps) {
  if (!message) {
    return null;
  }

  const action = code ? codeActions[code] : undefined;

  return (
    <div
      className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-danger bg-danger-light px-3 py-2 text-sm text-danger-dark"
      role="alert"
    >
      <p className="max-w-prose">{message}</p>
      {onRetry ? (
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 font-medium underline disabled:cursor-wait"
          onClick={onRetry}
          disabled={retrying}
        >
          {retrying ? <Spinner className="h-3.5 w-3.5" /> : null}
          {retrying ? 'Retrying...' : 'Try again'}
        </button>
      ) : action ? (
        <Link className="shrink-0 font-medium underline" to={action.to}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

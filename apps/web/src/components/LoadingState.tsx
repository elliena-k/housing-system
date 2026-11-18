import { Spinner } from './Spinner';

interface LoadingStateProps {
  message?: string;
  compact?: boolean;
}

export function LoadingState({ message = 'Loading...', compact = false }: LoadingStateProps) {
  if (compact) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-4 text-sm text-ink-600"
        role="status"
        aria-live="polite"
      >
        <Spinner className="h-4 w-4 text-primary" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-ink-200 bg-surface px-6 py-10 text-sm text-ink-600"
      role="status"
      aria-live="polite"
    >
      <Spinner className="h-6 w-6 text-primary" />
      <span>{message}</span>
    </div>
  );
}

import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retrying = false,
}: ErrorStateProps) {
  return (
    <div
      className="rounded-lg border border-danger bg-danger-light px-4 py-4 text-sm text-danger-dark"
      role="alert"
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-prose">{message}</p>
      {onRetry ? (
        <Button
          className="mt-3"
          variant="secondary"
          onClick={onRetry}
          loading={retrying}
          loadingLabel="Retrying..."
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}

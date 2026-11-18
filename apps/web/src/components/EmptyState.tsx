import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact
          ? 'px-4 py-8'
          : 'rounded-lg border border-dashed border-ink-300 bg-surface px-6 py-12'
      }`}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary">
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
            d="M3 10.5L12 3l9 7.5M5.25 9.75V21h13.5V9.75M9.75 21v-6h4.5v6"
          />
        </svg>
      </div>
      <p className="text-title font-semibold text-ink-900">{title}</p>
      <p className="mt-1 max-w-md text-sm text-ink-600">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

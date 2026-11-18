import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <section className={`rounded-lg border border-ink-200 bg-surface shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">{title}</h2>
        {description ? <p className="mt-1 text-sm text-ink-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

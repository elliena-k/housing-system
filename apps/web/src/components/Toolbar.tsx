import type { ReactNode } from 'react';

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-ink-200 bg-surface p-4 shadow-sm">
      {children}
    </div>
  );
}

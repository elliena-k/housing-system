function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-ink-100 ${className}`} />;
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2 px-4 py-4" role="status" aria-label="Loading table">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <SkeletonBlock key={columnIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      role="status"
      aria-label="Loading cards"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-lg border border-ink-200 bg-surface p-5">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-7 w-16" />
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

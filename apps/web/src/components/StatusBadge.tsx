import type { ApplicationStatus } from '@housing/shared';

const styles: Record<ApplicationStatus, string> = {
  pending: 'bg-warning-light text-warning-dark border-warning',
  approved: 'bg-success-light text-success-dark border-success',
  rejected: 'bg-danger-light text-danger-dark border-danger',
  allocated: 'bg-primary-100 text-primary-800 border-primary-300',
  cancelled: 'bg-ink-100 text-ink-700 border-ink-300',
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {label}
    </span>
  );
}

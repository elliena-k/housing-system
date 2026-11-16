import type { ApplicationStatus } from '@housing/shared';

const styles: Record<ApplicationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  allocated: 'bg-blue-100 text-blue-800 border-blue-300',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-300',
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

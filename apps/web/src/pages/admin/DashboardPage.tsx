import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { ErrorState } from '../../components/ErrorState';
import { CardSkeleton } from '../../components/Skeleton';
import { PageHeader } from '../../components/PageHeader';
import { authedFetch } from '../../lib/api';
import { errorInfo } from '../../lib/errors';
import { formatDate } from '../../lib/format';
import type { AdminStats, ApplicationWithStudent } from '../../lib/types';

const links = [
  {
    to: '/admin/applications',
    title: 'Applications',
    description: 'Review applications and approve or reject them.',
  },
  {
    to: '/admin/allocations',
    title: 'Allocations',
    description: 'Allocate approved students to rooms and cancel allocations.',
  },
  {
    to: '/admin/hostels',
    title: 'Hostels',
    description: 'Maintain hostel details, capacity, gender, and status.',
  },
  {
    to: '/admin/rooms',
    title: 'Rooms',
    description: 'Manage rooms, capacity, and availability.',
  },
];

export function AdminDashboardPage() {
  const { openSession } = useAuth();
  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => authedFetch<AdminStats>('/admin/stats'),
  });

  const recentQuery = useQuery({
    queryKey: ['admin', 'recent-applications', openSession],
    queryFn: () => {
      const query = openSession ? `?session=${encodeURIComponent(openSession)}` : '';
      return authedFetch<ApplicationWithStudent[]>(`/admin/applications${query}`);
    },
  });

  const stats = statsQuery.data;
  const recent = (recentQuery.data ?? []).slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Administrator dashboard"
        description="A summary of applications, allocations, and room availability."
      />

      {statsQuery.isLoading ? (
        <CardSkeleton count={7} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pending applications" value={stats?.applications.pending} />
          <StatCard label="Approved awaiting room" value={stats?.applications.approved} />
          <StatCard label="Active allocations" value={stats?.activeAllocations} />
          <StatCard label="Rooms with free space" value={stats?.roomsAvailable} />
          <StatCard label="Allocated applications" value={stats?.applications.allocated} />
          <StatCard label="Rejected applications" value={stats?.applications.rejected} />
          <StatCard label="Registered students" value={stats?.totalStudents} />
        </div>
      )}

      {statsQuery.isError ? (
        <div className="mt-4">
          <ErrorState
            message={errorInfo(statsQuery.error, 'We could not load dashboard statistics.').message}
            onRetry={() => void statsQuery.refetch()}
            retrying={statsQuery.isFetching}
          />
        </div>
      ) : null}

      <section className="mt-6 rounded-lg border border-ink-200 bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
            Recent applications
          </h2>
          <Link className="text-sm font-medium underline" to="/admin/applications">
            View all
          </Link>
        </div>
        <div className="p-5">
          {recentQuery.isLoading ? (
            <p className="text-sm text-ink-600">Loading recent applications...</p>
          ) : null}
          {recentQuery.isError ? (
            <p className="text-sm text-danger-dark">Could not load recent applications.</p>
          ) : null}
          {!recentQuery.isLoading && !recentQuery.isError && recent.length === 0 ? (
            <p className="text-sm text-ink-600">No applications yet.</p>
          ) : null}
          {recent.length > 0 ? (
            <ul className="divide-y divide-ink-100">
              {recent.map((application) => (
                <li
                  key={application.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                >
                  <span className="font-medium text-ink-900">
                    {application.student
                      ? `${application.student.first_name} ${application.student.last_name}`
                      : 'Unknown student'}
                  </span>
                  <span className="text-ink-600">{formatDate(application.application_date)}</span>
                  <span className="capitalize text-ink-600">{application.status}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.to}
            className="rounded-lg border border-ink-200 bg-surface p-6 shadow-sm transition hover:border-primary-300 hover:bg-primary-50"
            to={link.to}
          >
            <h2 className="text-title font-semibold text-ink-900">{link.title}</h2>
            <p className="mt-1 text-sm text-ink-600">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-surface p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 text-display font-semibold text-ink-900">
        {value === undefined ? '—' : value}
      </p>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { authedFetch } from '../../lib/api';
import type { AdminStats } from '../../lib/types';

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
  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => authedFetch<AdminStats>('/admin/stats'),
  });

  const stats = statsQuery.data;

  return (
    <div>
      <PageHeader
        title="Administrator dashboard"
        description="A summary of applications, allocations, and room availability."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending applications" value={stats?.applications.pending} />
        <StatCard label="Approved awaiting room" value={stats?.applications.approved} />
        <StatCard label="Active allocations" value={stats?.activeAllocations} />
        <StatCard label="Rooms with free space" value={stats?.roomsAvailable} />
        <StatCard label="Allocated applications" value={stats?.applications.allocated} />
        <StatCard label="Rejected applications" value={stats?.applications.rejected} />
        <StatCard label="Registered students" value={stats?.totalStudents} />
      </div>

      {statsQuery.isError ? (
        <p className="mt-4 text-sm text-danger-dark">Could not load dashboard statistics.</p>
      ) : null}

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

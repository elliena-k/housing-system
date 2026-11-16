import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { authedFetch } from '../../lib/api';
import type { StudentStatus } from '../../lib/types';

export function StudentDashboardPage() {
  const statusQuery = useQuery({
    queryKey: ['status'],
    queryFn: () => authedFetch<StudentStatus>('/status/me'),
  });

  if (statusQuery.isLoading) {
    return <p className="text-slate-600">Loading your dashboard...</p>;
  }

  if (statusQuery.isError || !statusQuery.data) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
        {statusQuery.error instanceof Error
          ? statusQuery.error.message
          : 'Could not load your dashboard.'}
      </div>
    );
  }

  const { student, application, allocation } = statusQuery.data;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${student.first_name}`}
        description={`${student.matric_no} · ${student.department} · Level ${student.level}`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Application
          </h2>
          {application ? (
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                Session: <span className="font-medium">{application.session}</span>
              </p>
              <p className="flex items-center gap-2">
                Status: <StatusBadge status={application.status} />
              </p>
              {application.remarks ? <p>Remarks: {application.remarks}</p> : null}
              <Link className="inline-block underline" to="/student/application">
                View application
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-3 text-sm text-slate-700">
              <p>You have not applied for accommodation yet.</p>
              <Link className="inline-block underline" to="/student/apply">
                Apply now
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Allocation
          </h2>
          {allocation ? (
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>
                Hostel: <span className="font-medium">{allocation.hostel_name ?? '—'}</span>
              </p>
              <p>
                Room: <span className="font-medium">{allocation.room_number ?? '—'}</span>
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-700">No room has been allocated yet.</p>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Profile</h2>
        <dl className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Faculty</dt>
            <dd className="font-medium">{student.faculty}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Department</dt>
            <dd className="font-medium">{student.department}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium">{student.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Phone</dt>
            <dd className="font-medium">{student.phone ?? '—'}</dd>
          </div>
        </dl>
        <Link className="mt-3 inline-block text-sm underline" to="/student/profile">
          Edit profile
        </Link>
      </section>
    </div>
  );
}

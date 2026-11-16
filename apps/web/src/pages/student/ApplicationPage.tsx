import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { authedFetch } from '../../lib/api';
import type { Application } from '../../lib/types';

export function ApplicationPage() {
  const applicationsQuery = useQuery({
    queryKey: ['applications'],
    queryFn: () => authedFetch<Application[]>('/applications/me'),
  });

  if (applicationsQuery.isLoading) {
    return <p className="text-ink-600">Loading your application...</p>;
  }

  if (applicationsQuery.isError || !applicationsQuery.data) {
    return (
      <div className="rounded-md border border-danger bg-danger-light px-4 py-3 text-sm text-danger-dark">
        Could not load your application.
      </div>
    );
  }

  const application = applicationsQuery.data[0];

  if (!application) {
    return (
      <div>
        <PageHeader title="Your application" />
        <div className="rounded-lg border border-ink-200 bg-surface p-6 shadow-sm">
          <p className="text-ink-700">You have not submitted an application yet.</p>
          <Link className="mt-3 inline-block underline" to="/student/apply">
            Apply for accommodation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Your application"
        description="This is the application on record for the current session."
        actions={<StatusBadge status={application.status} />}
      />

      <section className="rounded-lg border border-ink-200 bg-surface p-6 shadow-sm">
        <dl className="grid gap-4 text-sm text-ink-700 sm:grid-cols-2">
          <div>
            <dt className="text-ink-500">Session</dt>
            <dd className="font-medium">{application.session}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Date submitted</dt>
            <dd className="font-medium">{application.application_date}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Preference</dt>
            <dd className="font-medium">{application.preference ?? 'No preference'}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Remarks</dt>
            <dd className="font-medium">{application.remarks ?? '—'}</dd>
          </div>
        </dl>
      </section>

      <Link className="mt-4 inline-block text-sm underline" to="/student">
        Back to dashboard
      </Link>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { authedFetch } from '../../lib/api';
import { errorInfo } from '../../lib/errors';
import { formatDate } from '../../lib/format';
import type { Application } from '../../lib/types';

export function ApplicationPage() {
  const applicationsQuery = useQuery({
    queryKey: ['applications'],
    queryFn: () => authedFetch<Application[]>('/applications/me'),
  });

  if (applicationsQuery.isLoading) {
    return <LoadingState message="Loading your application..." />;
  }

  if (applicationsQuery.isError || !applicationsQuery.data) {
    return (
      <ErrorState
        message={errorInfo(applicationsQuery.error, 'We could not load your application.').message}
        onRetry={() => void applicationsQuery.refetch()}
        retrying={applicationsQuery.isFetching}
      />
    );
  }

  const application = applicationsQuery.data[0];

  if (!application) {
    return (
      <div>
        <PageHeader title="Your application" />
        <EmptyState
          title="No application yet"
          description="You have not submitted a housing application for the current session."
          action={
            <Link
              className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
              to="/student/apply"
            >
              Apply for accommodation
            </Link>
          }
        />
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
            <dd className="font-medium">{formatDate(application.application_date)}</dd>
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

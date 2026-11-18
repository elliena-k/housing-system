import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { authedFetch } from '../../lib/api';
import { errorInfo } from '../../lib/errors';
import type { Application, StudentStatus } from '../../lib/types';

const reviewStatuses = new Set(['approved', 'rejected', 'allocated']);

function applicationSteps(application: Application | null) {
  if (!application) {
    return [
      { label: 'Application submitted', state: 'current' },
      { label: 'Reviewed by administrator', state: 'upcoming' },
      { label: 'Room allocated', state: 'upcoming' },
    ] as const;
  }

  const reviewed = reviewStatuses.has(application.status);
  const allocated = application.status === 'allocated';

  return [
    { label: 'Application submitted', state: 'complete' },
    {
      label: 'Reviewed by administrator',
      state: reviewed ? 'complete' : 'current',
    },
    {
      label: 'Room allocated',
      state: allocated ? 'complete' : reviewed ? 'current' : 'upcoming',
    },
  ] as const;
}

export function StudentDashboardPage() {
  const statusQuery = useQuery({
    queryKey: ['status'],
    queryFn: () => authedFetch<StudentStatus>('/status/me'),
  });

  if (statusQuery.isLoading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  if (statusQuery.isError || !statusQuery.data) {
    return (
      <ErrorState
        message={errorInfo(statusQuery.error, 'We could not load your dashboard.').message}
        onRetry={() => void statusQuery.refetch()}
        retrying={statusQuery.isFetching}
      />
    );
  }

  const { student, application, allocation } = statusQuery.data;
  const profileFields = [
    student.first_name,
    student.last_name,
    student.matric_no,
    student.faculty,
    student.department,
    student.level,
    student.gender,
    student.email,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const completeness = Math.round((completedFields / profileFields.length) * 100);
  const steps = applicationSteps(application);
  const needsAttention = application?.status === 'rejected' || application?.status === 'cancelled';

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Welcome, ${student.first_name}`}
        description={`${student.matric_no} · ${student.department} · Level ${student.level}`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg border border-ink-200 bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
            Application
          </h2>
          {application ? (
            <div className="mt-3 space-y-2 text-sm text-ink-700">
              <p>
                Session: <span className="font-medium">{application.session}</span>
              </p>
              <p className="flex flex-wrap items-center gap-2">
                Status: <StatusBadge status={application.status} />
              </p>
              {application.remarks ? <p>Remarks: {application.remarks}</p> : null}
              <Link className="inline-block font-medium underline" to="/student/application">
                View application
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-3 text-sm text-ink-700">
              <p>You have not applied for accommodation yet.</p>
              <Link className="inline-block font-medium underline" to="/student/apply">
                Apply now
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-ink-200 bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Allocation</h2>
          {allocation ? (
            <div className="mt-3 space-y-2 text-sm text-ink-700">
              <p>
                Hostel: <span className="font-medium">{allocation.hostel_name ?? '—'}</span>
              </p>
              <p>
                Room: <span className="font-medium">{allocation.room_number ?? '—'}</span>
              </p>
              <p className="text-xs text-ink-500">Collect your keys from the hostel porter.</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-700">
              No room has been allocated yet. You will see it here once an administrator assigns
              one.
            </p>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-ink-200 bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Progress</h2>
          {needsAttention ? (
            <div className="mt-3 rounded-md border border-warning bg-warning-light px-3 py-2 text-sm text-warning-dark">
              This application is {application.status}. Check the remarks and contact the
              administrator if you need help.
            </div>
          ) : (
            <ol className="mt-4 space-y-3">
              {steps.map((step, index) => (
                <li key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                        step.state === 'complete'
                          ? 'border-success bg-success-light text-success-dark'
                          : step.state === 'current'
                            ? 'border-primary bg-primary text-white'
                            : 'border-ink-300 bg-surface text-ink-400'
                      }`}
                    >
                      {step.state === 'complete' ? '✓' : index + 1}
                    </span>
                    {index < steps.length - 1 ? (
                      <span className="mt-1 h-6 w-px bg-ink-200" />
                    ) : null}
                  </div>
                  <div className="pb-1">
                    <p
                      className={`text-sm font-medium ${
                        step.state === 'upcoming' ? 'text-ink-500' : 'text-ink-900'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-lg border border-ink-200 bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
            Profile completeness
          </h2>
          <p className="mt-3 text-display font-semibold text-ink-900">{completeness}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-primary" style={{ width: `${completeness}%` }} />
          </div>
          <p className="mt-2 text-sm text-ink-600">
            {completeness === 100
              ? 'Your profile is complete.'
              : 'Complete your profile so administrators can process your application.'}
          </p>
          <Link className="mt-3 inline-block text-sm font-medium underline" to="/student/profile">
            {completeness === 100 ? 'Review profile' : 'Complete profile'}
          </Link>
        </section>
      </div>

      <section className="rounded-lg border border-ink-200 bg-surface p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
          Student details
        </h2>
        <dl className="mt-3 grid gap-3 text-sm text-ink-700 sm:grid-cols-2">
          <div>
            <dt className="text-ink-500">Faculty</dt>
            <dd className="font-medium">{student.faculty}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Department</dt>
            <dd className="font-medium">{student.department}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Email</dt>
            <dd className="break-all font-medium">{student.email}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Phone</dt>
            <dd className="font-medium">{student.phone ?? '—'}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

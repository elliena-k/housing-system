import { zodResolver } from '@hookform/resolvers/zod';
import {
  reviewApplicationSchema,
  type ApplicationStatus,
  type ReviewApplicationInput,
} from '@housing/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormError } from '../../components/FormError';
import { PageHeader } from '../../components/PageHeader';
import { SelectField } from '../../components/SelectField';
import { StatusBadge } from '../../components/StatusBadge';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { useAuth } from '../../auth/AuthProvider';
import { authedFetch } from '../../lib/api';
import type { ApplicationWithStudent } from '../../lib/types';

const statusOptions: ApplicationStatus[] = [
  'pending',
  'approved',
  'rejected',
  'allocated',
  'cancelled',
];

export function AdminApplicationsPage() {
  const queryClient = useQueryClient();
  const { openSession } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [session, setSession] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (openSession && !session) {
      setSession(openSession);
    }
  }, [openSession, session]);

  const applicationsQuery = useQuery({
    queryKey: ['admin', 'applications', statusFilter, session, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter) {
        params.set('status', statusFilter);
      }
      if (session) {
        params.set('session', session);
      }
      if (search.trim()) {
        params.set('q', search.trim());
      }
      const query = params.toString();
      return authedFetch<ApplicationWithStudent[]>(
        `/admin/applications${query ? `?${query}` : ''}`
      );
    },
  });

  const detailQuery = useQuery({
    queryKey: ['admin', 'application', selectedId],
    queryFn: () => authedFetch<ApplicationWithStudent>(`/admin/applications/${selectedId}`),
    enabled: Boolean(selectedId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewApplicationInput>({
    resolver: zodResolver(reviewApplicationSchema),
    defaultValues: { status: 'approved', remarks: '' },
  });

  useEffect(() => {
    if (detailQuery.data) {
      reset({
        status: detailQuery.data.status === 'rejected' ? 'rejected' : 'approved',
        remarks: detailQuery.data.remarks ?? '',
      });
    }
  }, [detailQuery.data, reset]);

  const reviewMutation = useMutation({
    mutationFn: (values: ReviewApplicationInput) =>
      authedFetch<ApplicationWithStudent>(`/admin/applications/${selectedId}`, {
        method: 'PATCH',
        body: values,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin', 'application', selectedId], updated);
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!selectedId) {
      return;
    }
    await reviewMutation.mutateAsync(values);
  });

  const applications = applicationsQuery.data ?? [];
  const detail = detailQuery.data;

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Review student applications and approve or reject them."
      />

      <div className="mb-4 grid gap-3 rounded-lg border border-ink-200 bg-surface p-4 shadow-sm sm:grid-cols-3">
        <TextField
          label="Search"
          placeholder="Name or matriculation number"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <SelectField
          label="Status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Session"
          value={session}
          onChange={(event) => setSession(event.target.value)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="overflow-hidden rounded-lg border border-ink-200 bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-1 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Matric</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {applicationsQuery.isLoading ? (
                  <tr>
                    <td className="px-4 py-4 text-ink-600" colSpan={6}>
                      Loading applications...
                    </td>
                  </tr>
                ) : null}
                {applicationsQuery.isError ? (
                  <tr>
                    <td className="px-4 py-4 text-danger-dark" colSpan={6}>
                      Could not load applications.
                    </td>
                  </tr>
                ) : null}
                {!applicationsQuery.isLoading && applications.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-ink-600" colSpan={6}>
                      No applications match these filters.
                    </td>
                  </tr>
                ) : null}
                {applications.map((application) => (
                  <tr
                    key={application.id}
                    className={`border-t border-ink-100 ${
                      selectedId === application.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {application.student
                        ? `${application.student.first_name} ${application.student.last_name}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {application.student?.matric_no ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{application.session}</td>
                    <td className="px-4 py-3 text-ink-600">{application.application_date}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="text-sm font-medium text-primary underline"
                        onClick={() => setSelectedId(application.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-lg border border-ink-200 bg-surface p-5 shadow-sm">
          {!selectedId ? (
            <p className="text-sm text-ink-600">Select an application to review it.</p>
          ) : null}

          {selectedId && detailQuery.isLoading ? (
            <p className="text-sm text-ink-600">Loading application...</p>
          ) : null}

          {selectedId && detailQuery.isError ? (
            <p className="text-sm text-danger-dark">Could not load that application.</p>
          ) : null}

          {detail ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                  Student
                </h2>
                <dl className="mt-2 space-y-1 text-sm text-ink-700">
                  <p className="font-medium text-ink-900">
                    {detail.student
                      ? `${detail.student.first_name} ${detail.student.last_name}`
                      : 'Unknown student'}
                  </p>
                  <p>{detail.student?.matric_no}</p>
                  <p>{detail.student?.department}</p>
                  <p>
                    Level {detail.student?.level} · {detail.student?.gender}
                  </p>
                  <p>{detail.student?.email}</p>
                </dl>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                  Application
                </h2>
                <dl className="mt-2 space-y-1 text-sm text-ink-700">
                  <p>Session: {detail.session}</p>
                  <p>Preference: {detail.preference ?? 'No preference'}</p>
                  <p>Submitted: {detail.application_date}</p>
                  <p className="flex items-center gap-2">
                    Status: <StatusBadge status={detail.status} />
                  </p>
                  {detail.remarks ? <p>Remarks: {detail.remarks}</p> : null}
                </dl>
              </div>

              {detail.status === 'pending' ? (
                <form
                  className="space-y-3 border-t border-ink-100 pt-4"
                  onSubmit={onSubmit}
                  noValidate
                >
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                    Decision
                  </h2>
                  <FormError
                    message={
                      reviewMutation.error instanceof Error ? reviewMutation.error.message : null
                    }
                  />
                  <SelectField
                    label="Decision"
                    error={errors.status?.message}
                    {...register('status')}
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </SelectField>
                  <TextField
                    label="Remarks (optional)"
                    error={errors.remarks?.message}
                    {...register('remarks')}
                  />
                  <Button type="submit" disabled={isSubmitting || reviewMutation.isPending}>
                    {reviewMutation.isPending ? 'Saving...' : 'Save decision'}
                  </Button>
                </form>
              ) : (
                <p className="border-t border-ink-100 pt-4 text-sm text-ink-600">
                  This application has already been reviewed.
                </p>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

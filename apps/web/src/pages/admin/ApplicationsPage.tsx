import { zodResolver } from '@hookform/resolvers/zod';
import {
  reviewApplicationSchema,
  type ApplicationStatus,
  type ReviewApplicationInput,
} from '@housing/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Drawer } from '../../components/Drawer';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { FormError } from '../../components/FormError';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { SelectField } from '../../components/SelectField';
import { TableSkeleton } from '../../components/Skeleton';
import { Spinner } from '../../components/Spinner';
import { StatusBadge } from '../../components/StatusBadge';
import { TextField } from '../../components/TextField';
import { Toolbar } from '../../components/Toolbar';
import { useToast } from '../../components/Toast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { authedFetch } from '../../lib/api';
import { errorInfo } from '../../lib/errors';
import { formatDate } from '../../lib/format';
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
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const sessionInitialised = useRef(false);
  const urlQuery = params.get('q') ?? '';
  const [search, setSearch] = useState(urlQuery);
  const debouncedSearch = useDebouncedValue(search, 300);
  const statusFilter = params.get('status') ?? '';
  const session = params.get('session') ?? '';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingReject, setPendingReject] = useState<ReviewApplicationInput | null>(null);

  useEffect(() => {
    if (sessionInitialised.current) {
      return;
    }
    sessionInitialised.current = true;

    if (openSession && !params.has('session')) {
      const next = new URLSearchParams(params);
      next.set('session', openSession);
      setParams(next, { replace: true });
    }
  }, [openSession, params, setParams]);

  useEffect(() => {
    if (debouncedSearch === urlQuery) {
      return;
    }
    const next = new URLSearchParams(params);
    if (debouncedSearch) {
      next.set('q', debouncedSearch);
    } else {
      next.delete('q');
    }
    setParams(next, { replace: true });
  }, [debouncedSearch, urlQuery, params, setParams]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setParams(next, { replace: true });
  };

  const applicationsQuery = useQuery({
    queryKey: ['admin', 'applications', statusFilter, session, debouncedSearch],
    queryFn: () => {
      const query = new URLSearchParams();
      if (statusFilter) {
        query.set('status', statusFilter);
      }
      if (session) {
        query.set('session', session);
      }
      if (debouncedSearch) {
        query.set('q', debouncedSearch);
      }
      const suffix = query.toString();
      return authedFetch<ApplicationWithStudent[]>(
        `/admin/applications${suffix ? `?${suffix}` : ''}`
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
      toast({
        title: updated.status === 'approved' ? 'Application approved' : 'Application rejected',
        description: 'The student will see the updated status on their dashboard.',
        variant: 'success',
      });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!selectedId) {
      return;
    }

    if (values.status === 'rejected') {
      setPendingReject(values);
      return;
    }

    await reviewMutation.mutateAsync(values);
  });

  const confirmReject = async () => {
    if (!pendingReject) {
      return;
    }

    try {
      await reviewMutation.mutateAsync(pendingReject);
      setPendingReject(null);
    } catch {
      setPendingReject(null);
    }
  };

  const applications = applicationsQuery.data ?? [];
  const detail = detailQuery.data;
  const filtersActive = Boolean(statusFilter || urlQuery);

  const clearFilters = () => {
    sessionInitialised.current = true;
    setParams(new URLSearchParams(), { replace: true });
    setSearch('');
  };

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Review student applications and approve or reject them."
      />

      <Toolbar>
        <div className="w-full sm:w-64">
          <TextField
            label="Search"
            requirement="optional"
            placeholder="Name or matriculation number"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={(event) => updateParam('status', event.target.value)}
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="w-full sm:w-44">
          <TextField
            label="Session"
            requirement="optional"
            placeholder="e.g. 2026/2027"
            value={session}
            onChange={(event) => updateParam('session', event.target.value)}
          />
        </div>
        {applicationsQuery.isFetching && !applicationsQuery.isLoading ? (
          <span className="inline-flex items-center gap-1.5 pb-2 text-sm text-ink-500">
            <Spinner className="h-3.5 w-3.5" />
            Updating...
          </span>
        ) : null}
      </Toolbar>

      {applicationsQuery.isError ? (
        <ErrorState
          message={errorInfo(applicationsQuery.error, 'We could not load applications.').message}
          onRetry={() => void applicationsQuery.refetch()}
          retrying={applicationsQuery.isFetching}
        />
      ) : null}

      {applicationsQuery.isLoading ? (
        <div className="overflow-hidden rounded-lg border border-ink-200 bg-surface shadow-sm">
          <TableSkeleton rows={6} columns={6} />
        </div>
      ) : null}

      {!applicationsQuery.isLoading && !applicationsQuery.isError && applications.length === 0 ? (
        <EmptyState
          title="No applications found"
          description={
            filtersActive
              ? 'No applications match these filters. Try clearing them.'
              : 'No students have applied yet.'
          }
          action={
            filtersActive ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {applications.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-ink-200 bg-surface shadow-sm">
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
                {applications.map((application) => (
                  <tr key={application.id} className="border-t border-ink-100">
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {application.student
                        ? `${application.student.first_name} ${application.student.last_name}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {application.student?.matric_no ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{application.session}</td>
                    <td className="px-4 py-3 text-ink-600">
                      {formatDate(application.application_date)}
                    </td>
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
        </div>
      ) : null}

      <Drawer
        open={Boolean(selectedId)}
        title="Application details"
        onClose={() => setSelectedId(null)}
      >
        {detailQuery.isLoading ? <LoadingState message="Loading application..." compact /> : null}

        {detailQuery.isError ? (
          <ErrorState
            message={errorInfo(detailQuery.error, 'We could not load that application.').message}
            onRetry={() => void detailQuery.refetch()}
            retrying={detailQuery.isFetching}
          />
        ) : null}

        {detail ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                Student
              </h3>
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
                <p className="break-all">{detail.student?.email}</p>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                Application
              </h3>
              <dl className="mt-2 space-y-1 text-sm text-ink-700">
                <p>Session: {detail.session}</p>
                <p>Preference: {detail.preference ?? 'No preference'}</p>
                <p>Submitted: {formatDate(detail.application_date)}</p>
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
                <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                  Decision
                </h3>
                <FormError
                  message={reviewMutation.error ? errorInfo(reviewMutation.error).message : null}
                  code={reviewMutation.error ? errorInfo(reviewMutation.error).code : undefined}
                  onRetry={() => void detailQuery.refetch()}
                  retrying={detailQuery.isFetching}
                />
                <SelectField
                  label="Decision"
                  requirement="required"
                  error={errors.status?.message}
                  {...register('status')}
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </SelectField>
                <TextField
                  label="Remarks"
                  requirement="optional"
                  error={errors.remarks?.message}
                  {...register('remarks')}
                />
                <Button
                  type="submit"
                  loading={isSubmitting || reviewMutation.isPending}
                  loadingLabel="Saving..."
                >
                  Save decision
                </Button>
              </form>
            ) : (
              <p className="border-t border-ink-100 pt-4 text-sm text-ink-600">
                This application has already been reviewed.
              </p>
            )}
          </div>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={Boolean(pendingReject)}
        title="Reject application"
        description={
          detail
            ? `Reject the application from ${detail.student?.first_name ?? 'this student'} ${
                detail.student?.last_name ?? ''
              }? Add a reason in the remarks field so the student understands the decision.`
            : 'Reject this application?'
        }
        confirmLabel="Reject application"
        destructive
        loading={reviewMutation.isPending}
        onConfirm={() => void confirmReject()}
        onCancel={() => {
          if (!reviewMutation.isPending) {
            setPendingReject(null);
          }
        }}
      />
    </div>
  );
}

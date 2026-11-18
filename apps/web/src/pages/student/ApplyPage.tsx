import { zodResolver } from '@hookform/resolvers/zod';
import { createApplicationSchema, type CreateApplicationInput } from '@housing/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { FormError } from '../../components/FormError';
import { PageHeader } from '../../components/PageHeader';
import { TextField } from '../../components/TextField';
import { useToast } from '../../components/Toast';
import { authedFetch } from '../../lib/api';
import { errorInfo } from '../../lib/errors';
import type { Application, MyAccount, StudentStatus } from '../../lib/types';

export function ApplyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const accountQuery = useQuery({
    queryKey: ['account'],
    queryFn: () => authedFetch<MyAccount>('/me'),
  });

  const statusQuery = useQuery({
    queryKey: ['status'],
    queryFn: () => authedFetch<StudentStatus>('/status/me'),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateApplicationInput>({ resolver: zodResolver(createApplicationSchema) });

  useEffect(() => {
    if (accountQuery.data) {
      setValue('session', accountQuery.data.session);
    }
  }, [accountQuery.data, setValue]);

  const mutation = useMutation({
    mutationFn: (values: CreateApplicationInput) =>
      authedFetch<Application>('/applications', { method: 'POST', body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: 'Application submitted',
        description: 'You can track its status from your dashboard.',
        variant: 'success',
      });
      navigate('/student/application', { replace: true });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  if (accountQuery.isLoading || statusQuery.isLoading) {
    return <LoadingState message="Loading your application form..." />;
  }

  if (accountQuery.isError || statusQuery.isError || !accountQuery.data) {
    return (
      <ErrorState
        message="We could not load your application form. Please try again."
        onRetry={() => {
          void accountQuery.refetch();
          void statusQuery.refetch();
        }}
        retrying={accountQuery.isFetching || statusQuery.isFetching}
      />
    );
  }

  const { student, session } = accountQuery.data;

  if (!student) {
    return (
      <div className="rounded-md border border-warning bg-warning-light px-4 py-3 text-sm text-warning-dark">
        <p>Your student profile is incomplete. Contact the administrator for help.</p>
        <Link className="mt-2 inline-block font-medium underline" to="/student/profile">
          Review your profile
        </Link>
      </div>
    );
  }

  const existing = statusQuery.data?.application;

  if (existing) {
    return (
      <div>
        <PageHeader title="Housing application" />
        <div className="rounded-lg border border-ink-200 bg-surface p-6 shadow-sm">
          <p className="text-ink-700">
            You have already applied for the {existing.session} session.
          </p>
          <Link className="mt-3 inline-block underline" to="/student/application">
            View your application
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Apply for accommodation"
        description={`Applications are open for the ${session} session.`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-ink-200 bg-surface p-5 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Applicant</h2>
          <dl className="mt-3 space-y-2 text-sm text-ink-700">
            <div>
              <dt className="text-ink-500">Name</dt>
              <dd className="font-medium">
                {student.first_name} {student.last_name}
              </dd>
            </div>
            <div>
              <dt className="text-ink-500">Matriculation number</dt>
              <dd className="font-medium">{student.matric_no}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Level</dt>
              <dd className="font-medium">{student.level}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Session</dt>
              <dd className="font-medium">{session}</dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-ink-100 pt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
              Before you apply
            </h2>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start gap-2 text-ink-700">
                <span className="mt-0.5 text-success" aria-hidden="true">
                  ✓
                </span>
                <span>Your profile is complete.</span>
              </li>
              <li className="flex items-start gap-2 text-ink-700">
                <span className="mt-0.5 text-success" aria-hidden="true">
                  ✓
                </span>
                <span>You have not applied for this session.</span>
              </li>
              <li className="flex items-start gap-2 text-ink-700">
                <span
                  className={`mt-0.5 ${statusQuery.data?.allocation ? 'text-warning' : 'text-success'}`}
                  aria-hidden="true"
                >
                  {statusQuery.data?.allocation ? '!' : '✓'}
                </span>
                <span>
                  {statusQuery.data?.allocation
                    ? 'You already hold an allocation. Contact the administrator if this is unexpected.'
                    : 'You do not hold an active allocation.'}
                </span>
              </li>
            </ul>
          </div>
        </section>

        <form
          className="space-y-4 rounded-lg border border-ink-200 bg-surface p-6 shadow-sm lg:col-span-2"
          onSubmit={onSubmit}
          noValidate
        >
          <FormError
            message={mutation.error ? errorInfo(mutation.error).message : null}
            code={mutation.error ? errorInfo(mutation.error).code : undefined}
            onRetry={() => {
              void statusQuery.refetch();
              void accountQuery.refetch();
            }}
            retrying={statusQuery.isFetching || accountQuery.isFetching}
          />
          <input type="hidden" {...register('session')} />
          <TextField
            label="Accommodation preference"
            requirement="optional"
            placeholder="e.g. Queen Idia Hall"
            hint="We will try to match your preference, but it is not guaranteed."
            error={errors.preference?.message}
            {...register('preference')}
          />
          <p className="text-sm text-ink-600">
            Submit one application per session. You can check its status from your dashboard.
          </p>
          <Button
            type="submit"
            loading={isSubmitting || mutation.isPending}
            loadingLabel="Submitting..."
          >
            Submit application
          </Button>
        </form>
      </div>
    </div>
  );
}

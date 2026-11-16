import { zodResolver } from '@hookform/resolvers/zod';
import { createApplicationSchema, type CreateApplicationInput } from '@housing/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { PageHeader } from '../../components/PageHeader';
import { TextField } from '../../components/TextField';
import { authedFetch } from '../../lib/api';
import type { Application, MyAccount, StudentStatus } from '../../lib/types';

export function ApplyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
      navigate('/student/application', { replace: true });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  if (accountQuery.isLoading || statusQuery.isLoading) {
    return <p className="text-slate-600">Loading your application form...</p>;
  }

  if (accountQuery.isError || statusQuery.isError || !accountQuery.data) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
        Could not load your application form. Please refresh the page.
      </div>
    );
  }

  const { student, session } = accountQuery.data;

  if (!student) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Your student profile is incomplete. Contact the administrator.
      </div>
    );
  }

  const existing = statusQuery.data?.application;

  if (existing) {
    return (
      <div>
        <PageHeader title="Housing application" />
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-700">
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
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Applicant
          </h2>
          <dl className="mt-3 space-y-2 text-sm text-slate-700">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium">
                {student.first_name} {student.last_name}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Matriculation number</dt>
              <dd className="font-medium">{student.matric_no}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Level</dt>
              <dd className="font-medium">{student.level}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Session</dt>
              <dd className="font-medium">{session}</dd>
            </div>
          </dl>
        </section>

        <form
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
          onSubmit={onSubmit}
          noValidate
        >
          <FormError message={mutation.error instanceof Error ? mutation.error.message : null} />
          <input type="hidden" {...register('session')} />
          <TextField
            label="Accommodation preference (optional)"
            placeholder="e.g. Queen Idia Hall"
            error={errors.preference?.message}
            {...register('preference')}
          />
          <p className="text-sm text-slate-600">
            Submit one application per session. You can check its status from your dashboard.
          </p>
          <Button type="submit" disabled={isSubmitting || mutation.isPending}>
            {isSubmitting || mutation.isPending ? 'Submitting...' : 'Submit application'}
          </Button>
        </form>
      </div>
    </div>
  );
}

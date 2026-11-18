import { zodResolver } from '@hookform/resolvers/zod';
import { updateStudentSchema, type UpdateStudentInput } from '@housing/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { FormError } from '../../components/FormError';
import { PageHeader } from '../../components/PageHeader';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { useToast } from '../../components/Toast';
import { authedFetch } from '../../lib/api';
import { errorInfo } from '../../lib/errors';
import type { Student } from '../../lib/types';

const levels = [100, 200, 300, 400, 500, 600];

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { refresh } = useAuth();
  const { toast } = useToast();

  const studentQuery = useQuery({
    queryKey: ['student'],
    queryFn: () => authedFetch<Student>('/students/me'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateStudentInput>({ resolver: zodResolver(updateStudentSchema) });

  useEffect(() => {
    if (studentQuery.data) {
      reset({
        first_name: studentQuery.data.first_name,
        last_name: studentQuery.data.last_name,
        gender: studentQuery.data.gender,
        faculty: studentQuery.data.faculty,
        department: studentQuery.data.department,
        level: studentQuery.data.level,
        phone: studentQuery.data.phone ?? '',
      });
    }
  }, [studentQuery.data, reset]);

  const mutation = useMutation({
    mutationFn: (values: UpdateStudentInput) =>
      authedFetch<Student>('/students/me', { method: 'PUT', body: values }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['student'], updated);
      queryClient.invalidateQueries({ queryKey: ['status'] });
      toast({
        title: 'Profile updated',
        description: 'Your details have been saved.',
        variant: 'success',
      });
      void refresh();
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  const discardChanges = () => {
    if (!studentQuery.data) {
      return;
    }
    reset({
      first_name: studentQuery.data.first_name,
      last_name: studentQuery.data.last_name,
      gender: studentQuery.data.gender,
      faculty: studentQuery.data.faculty,
      department: studentQuery.data.department,
      level: studentQuery.data.level,
      phone: studentQuery.data.phone ?? '',
    });
  };

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (studentQuery.isLoading) {
    return <LoadingState message="Loading your profile..." />;
  }

  if (studentQuery.isError || !studentQuery.data) {
    return (
      <ErrorState
        message={errorInfo(studentQuery.error, 'We could not load your profile.').message}
        onRetry={() => void studentQuery.refetch()}
        retrying={studentQuery.isFetching}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Your profile"
        description="Keep your details up to date. Your matriculation number cannot be changed."
      />

      <form
        className="space-y-4 rounded-lg border border-ink-200 bg-surface p-6 shadow-sm"
        onSubmit={onSubmit}
        noValidate
      >
        <FormError
          message={mutation.error ? errorInfo(mutation.error).message : null}
          code={mutation.error ? errorInfo(mutation.error).code : undefined}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            requirement="required"
            error={errors.first_name?.message}
            {...register('first_name')}
          />
          <TextField
            label="Last name"
            requirement="required"
            error={errors.last_name?.message}
            {...register('last_name')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="block text-sm font-medium text-ink-700">Matriculation number</span>
            <p className="rounded-md border border-ink-200 bg-surface-1 px-3 py-2 text-sm text-ink-600">
              {studentQuery.data.matric_no}
            </p>
          </div>
          <div className="space-y-1">
            <span className="block text-sm font-medium text-ink-700">Email address</span>
            <p className="rounded-md border border-ink-200 bg-surface-1 px-3 py-2 text-sm text-ink-600">
              {studentQuery.data.email}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Faculty"
            requirement="required"
            error={errors.faculty?.message}
            {...register('faculty')}
          />
          <TextField
            label="Department"
            requirement="required"
            error={errors.department?.message}
            {...register('department')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Level"
            requirement="required"
            error={errors.level?.message}
            {...register('level', { valueAsNumber: true })}
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Gender"
            requirement="required"
            error={errors.gender?.message}
            {...register('gender')}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </SelectField>
          <TextField
            label="Phone"
            requirement="optional"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-200 bg-surface/95 p-3 shadow-lg backdrop-blur">
          <p className="text-sm text-ink-600">
            {isDirty ? 'You have unsaved changes.' : 'All changes are saved.'}
          </p>
          <div className="flex gap-2">
            {isDirty ? (
              <Button type="button" variant="secondary" onClick={discardChanges}>
                Discard
              </Button>
            ) : null}
            <Button
              type="submit"
              loading={isSubmitting || mutation.isPending}
              loadingLabel="Saving..."
              disabled={!isDirty}
            >
              Save changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

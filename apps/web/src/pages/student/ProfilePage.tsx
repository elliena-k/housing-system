import { zodResolver } from '@hookform/resolvers/zod';
import { updateStudentSchema, type UpdateStudentInput } from '@housing/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { PageHeader } from '../../components/PageHeader';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { authedFetch } from '../../lib/api';
import type { Student } from '../../lib/types';

const levels = [100, 200, 300, 400, 500, 600];

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { refresh } = useAuth();
  const [saved, setSaved] = useState(false);

  const studentQuery = useQuery({
    queryKey: ['student'],
    queryFn: () => authedFetch<Student>('/students/me'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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
      setSaved(true);
      void refresh();
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSaved(false);
    await mutation.mutateAsync(values);
  });

  if (studentQuery.isLoading) {
    return <p className="text-slate-600">Loading your profile...</p>;
  }

  if (studentQuery.isError || !studentQuery.data) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
        {studentQuery.error instanceof Error
          ? studentQuery.error.message
          : 'Could not load your profile.'}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Your profile"
        description="Keep your details up to date. Your matriculation number cannot be changed."
      />

      <form
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={onSubmit}
        noValidate
      >
        <FormError message={mutation.error instanceof Error ? mutation.error.message : null} />
        {saved ? (
          <div className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
            Profile updated.
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            error={errors.first_name?.message}
            {...register('first_name')}
          />
          <TextField
            label="Last name"
            error={errors.last_name?.message}
            {...register('last_name')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Matriculation number</span>
            <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {studentQuery.data.matric_no}
            </p>
          </div>
          <div className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Email address</span>
            <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {studentQuery.data.email}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Faculty" error={errors.faculty?.message} {...register('faculty')} />
          <TextField
            label="Department"
            error={errors.department?.message}
            {...register('department')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Level"
            error={errors.level?.message}
            {...register('level', { valueAsNumber: true })}
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </SelectField>
          <SelectField label="Gender" error={errors.gender?.message} {...register('gender')}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </SelectField>
          <TextField
            label="Phone (optional)"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <Button type="submit" disabled={isSubmitting || mutation.isPending}>
          {isSubmitting || mutation.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </div>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { createHostelSchema, type CreateHostelInput } from '@housing/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { PageHeader } from '../../components/PageHeader';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { authedFetch } from '../../lib/api';
import type { Hostel } from '../../lib/types';

const emptyHostel: CreateHostelInput = {
  name: '',
  gender_type: 'mixed',
  status: 'active',
};

const numberField = (value: unknown): number | undefined => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export function AdminHostelsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Hostel | null>(null);

  const hostelsQuery = useQuery({
    queryKey: ['hostels'],
    queryFn: () => authedFetch<Hostel[]>('/hostels'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateHostelInput>({
    resolver: zodResolver(createHostelSchema),
    defaultValues: emptyHostel,
  });

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        location: editing.location ?? '',
        capacity: editing.capacity ?? undefined,
        gender_type: editing.gender_type,
        status: editing.status,
      });
    } else {
      reset(emptyHostel);
    }
  }, [editing, reset]);

  const mutation = useMutation({
    mutationFn: (values: CreateHostelInput) => {
      const payload = {
        ...values,
        location: values.location?.trim() ? values.location.trim() : undefined,
      };

      return editing
        ? authedFetch<Hostel>(`/admin/hostels/${editing.id}`, {
            method: 'PATCH',
            body: payload,
          })
        : authedFetch<Hostel>('/admin/hostels', { method: 'POST', body: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
      setEditing(null);
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  const hostels = hostelsQuery.data ?? [];

  return (
    <div>
      <PageHeader title="Hostels" description="Add hostels and keep their details up to date." />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form
          className="space-y-4 rounded-lg border border-ink-200 bg-surface p-5 shadow-sm"
          onSubmit={onSubmit}
          noValidate
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
            {editing ? 'Edit hostel' : 'Add hostel'}
          </h2>
          <FormError message={mutation.error instanceof Error ? mutation.error.message : null} />

          <TextField label="Hostel name" error={errors.name?.message} {...register('name')} />
          <TextField
            label="Location (optional)"
            error={errors.location?.message}
            {...register('location')}
          />
          <TextField
            label="Capacity (optional)"
            type="number"
            min={1}
            error={errors.capacity?.message}
            {...register('capacity', { setValueAs: numberField })}
          />
          <SelectField
            label="Gender"
            error={errors.gender_type?.message}
            {...register('gender_type')}
          >
            <option value="mixed">Mixed</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </SelectField>
          <SelectField label="Status" error={errors.status?.message} {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </SelectField>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {editing ? 'Save changes' : 'Add hostel'}
            </Button>
            {editing ? (
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        <section className="overflow-hidden rounded-lg border border-ink-200 bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-1 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {hostelsQuery.isLoading ? (
                  <tr>
                    <td className="px-4 py-4 text-ink-600" colSpan={6}>
                      Loading hostels...
                    </td>
                  </tr>
                ) : null}
                {hostelsQuery.isError ? (
                  <tr>
                    <td className="px-4 py-4 text-danger-dark" colSpan={6}>
                      Could not load hostels.
                    </td>
                  </tr>
                ) : null}
                {!hostelsQuery.isLoading && hostels.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-ink-600" colSpan={6}>
                      No hostels yet.
                    </td>
                  </tr>
                ) : null}
                {hostels.map((hostel) => (
                  <tr key={hostel.id} className="border-t border-ink-100">
                    <td className="px-4 py-3 font-medium text-ink-900">{hostel.name}</td>
                    <td className="px-4 py-3 text-ink-600">{hostel.location ?? '—'}</td>
                    <td className="px-4 py-3 capitalize text-ink-600">{hostel.gender_type}</td>
                    <td className="px-4 py-3 text-ink-600">{hostel.capacity ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          hostel.status === 'active'
                            ? 'border-success bg-success-light text-success-dark'
                            : 'border-ink-300 bg-ink-100 text-ink-700'
                        }`}
                      >
                        {hostel.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="text-sm font-medium text-primary underline"
                        onClick={() => setEditing(hostel)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

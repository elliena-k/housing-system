import { zodResolver } from '@hookform/resolvers/zod';
import { createAllocationSchema, type CreateAllocationInput } from '@housing/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { PageHeader } from '../../components/PageHeader';
import { SelectField } from '../../components/SelectField';
import { authedFetch } from '../../lib/api';
import type { AllocationListItem, ApplicationWithStudent, Hostel, Room } from '../../lib/types';

export function AdminAllocationsPage() {
  const queryClient = useQueryClient();
  const { openSession } = useAuth();
  const [hostelId, setHostelId] = useState('');

  const approvedQuery = useQuery({
    queryKey: ['admin', 'applications', 'approved', openSession],
    queryFn: () => {
      const params = new URLSearchParams({ status: 'approved' });
      if (openSession) {
        params.set('session', openSession);
      }
      return authedFetch<ApplicationWithStudent[]>(`/admin/applications?${params.toString()}`);
    },
  });

  const hostelsQuery = useQuery({
    queryKey: ['hostels'],
    queryFn: () => authedFetch<Hostel[]>('/hostels'),
  });

  const allocationsQuery = useQuery({
    queryKey: ['admin', 'allocations'],
    queryFn: () => authedFetch<AllocationListItem[]>('/admin/allocations'),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAllocationInput>({
    resolver: zodResolver(createAllocationSchema),
    defaultValues: { application_id: '', room_id: '' },
  });

  const applicationId = watch('application_id');
  const approved = approvedQuery.data ?? [];
  const selectedApplication = approved.find((application) => application.id === applicationId);
  const studentGender = selectedApplication?.student?.gender ?? null;
  const hostels = hostelsQuery.data ?? [];
  const eligibleHostels = hostels.filter(
    (hostel) =>
      hostel.status === 'active' &&
      (!studentGender || hostel.gender_type === 'mixed' || hostel.gender_type === studentGender)
  );

  useEffect(() => {
    setHostelId('');
    setValue('room_id', '');
  }, [applicationId, setValue]);

  const roomsQuery = useQuery({
    queryKey: ['admin', 'rooms', 'available', hostelId],
    queryFn: () => authedFetch<Room[]>(`/admin/rooms/available?hostel_id=${hostelId}`),
    enabled: Boolean(hostelId),
  });

  const allocationMutation = useMutation({
    mutationFn: (values: CreateAllocationInput) =>
      authedFetch<AllocationListItem>('/admin/allocations', {
        method: 'POST',
        body: values,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'allocations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      reset({ application_id: '', room_id: '' });
      setHostelId('');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) =>
      authedFetch<AllocationListItem>(`/admin/allocations/${id}/cancel`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'allocations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await allocationMutation.mutateAsync(values);
  });

  const rooms = roomsQuery.data ?? [];
  const allocations = allocationsQuery.data ?? [];

  return (
    <div>
      <PageHeader
        title="Allocations"
        description="Allocate approved applications to available rooms, or cancel an allocation."
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form
          className="space-y-4 rounded-lg border border-ink-200 bg-surface p-5 shadow-sm"
          onSubmit={onSubmit}
          noValidate
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
            Allocate a room
          </h2>
          <FormError
            message={
              allocationMutation.error instanceof Error ? allocationMutation.error.message : null
            }
          />

          <SelectField
            label="Approved application"
            error={errors.application_id?.message}
            {...register('application_id')}
          >
            <option value="">Select application</option>
            {approved.map((application) => (
              <option key={application.id} value={application.id}>
                {application.student
                  ? `${application.student.first_name} ${application.student.last_name} (${application.student.matric_no})`
                  : application.id}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Hostel"
            value={hostelId}
            onChange={(event) => {
              setHostelId(event.target.value);
              setValue('room_id', '');
            }}
            disabled={!applicationId}
          >
            <option value="">Select hostel</option>
            {eligibleHostels.map((hostel) => (
              <option key={hostel.id} value={hostel.id}>
                {hostel.name}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Room"
            error={errors.room_id?.message}
            disabled={!hostelId}
            {...register('room_id')}
          >
            <option value="">
              {!hostelId
                ? 'Select a hostel first'
                : roomsQuery.isLoading
                  ? 'Loading rooms...'
                  : rooms.length === 0
                    ? 'No available rooms'
                    : 'Select room'}
            </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.room_number} ({room.occupancy}/{room.capacity})
              </option>
            ))}
          </SelectField>

          {approved.length === 0 ? (
            <p className="text-sm text-ink-600">
              There are no approved applications waiting for a room.
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting || allocationMutation.isPending || !applicationId}
          >
            {allocationMutation.isPending ? 'Allocating...' : 'Allocate room'}
          </Button>
        </form>

        <section className="overflow-hidden rounded-lg border border-ink-200 bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-1 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Matric</th>
                  <th className="px-4 py-3">Hostel</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {allocationsQuery.isLoading ? (
                  <tr>
                    <td className="px-4 py-4 text-ink-600" colSpan={7}>
                      Loading allocations...
                    </td>
                  </tr>
                ) : null}
                {allocationsQuery.isError ? (
                  <tr>
                    <td className="px-4 py-4 text-danger-dark" colSpan={7}>
                      Could not load allocations.
                    </td>
                  </tr>
                ) : null}
                {!allocationsQuery.isLoading && allocations.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-ink-600" colSpan={7}>
                      No allocations yet.
                    </td>
                  </tr>
                ) : null}
                {allocations.map((allocation) => (
                  <tr key={allocation.id} className="border-t border-ink-100">
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {allocation.student_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{allocation.matric_no ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-600">{allocation.hostel_name ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-600">{allocation.room_number ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-600">
                      {new Date(allocation.allocation_date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          allocation.status === 'active'
                            ? 'border-success bg-success-light text-success-dark'
                            : 'border-ink-300 bg-ink-100 text-ink-600'
                        }`}
                      >
                        {allocation.status === 'active' ? 'Active' : 'Cancelled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {allocation.status === 'active' ? (
                        <button
                          type="button"
                          className="text-sm font-medium text-danger underline"
                          disabled={cancelMutation.isPending}
                          onClick={() => cancelMutation.mutate(allocation.id)}
                        >
                          Cancel
                        </button>
                      ) : null}
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

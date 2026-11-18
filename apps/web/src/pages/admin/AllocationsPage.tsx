import { zodResolver } from '@hookform/resolvers/zod';
import { createAllocationSchema, type CreateAllocationInput } from '@housing/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { FormError } from '../../components/FormError';
import { TableSkeleton } from '../../components/Skeleton';
import { Spinner } from '../../components/Spinner';
import { PageHeader } from '../../components/PageHeader';
import { SelectField } from '../../components/SelectField';
import { useToast } from '../../components/Toast';
import { authedFetch } from '../../lib/api';
import { errorInfo } from '../../lib/errors';
import { formatDate } from '../../lib/format';
import type { AllocationListItem, ApplicationWithStudent, Hostel, Room } from '../../lib/types';

export function AdminAllocationsPage() {
  const queryClient = useQueryClient();
  const { openSession } = useAuth();
  const { toast } = useToast();
  const [hostelId, setHostelId] = useState('');
  const [pendingCancel, setPendingCancel] = useState<AllocationListItem | null>(null);

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
      toast({
        title: 'Room allocated',
        description: 'The student now has an active allocation.',
        variant: 'success',
      });
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
      toast({
        title: 'Allocation cancelled',
        description: 'The bed has been freed and the application returned to approved.',
        variant: 'success',
      });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await allocationMutation.mutateAsync(values);
  });

  const handleConfirmCancel = async () => {
    if (!pendingCancel) {
      return;
    }

    try {
      await cancelMutation.mutateAsync(pendingCancel.id);
      setPendingCancel(null);
    } catch {
      setPendingCancel(null);
    }
  };

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
            message={allocationMutation.error ? errorInfo(allocationMutation.error).message : null}
            code={allocationMutation.error ? errorInfo(allocationMutation.error).code : undefined}
            onRetry={() => void roomsQuery.refetch()}
            retrying={roomsQuery.isFetching}
          />
          {approvedQuery.isError ? (
            <FormError
              message={
                errorInfo(approvedQuery.error, 'We could not load approved applications.').message
              }
              onRetry={() => void approvedQuery.refetch()}
              retrying={approvedQuery.isFetching}
            />
          ) : null}

          <SelectField
            label="Approved application"
            requirement="required"
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
            requirement="required"
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
            requirement="required"
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

          {hostelId && roomsQuery.isLoading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-500">
              <Spinner className="h-3.5 w-3.5" />
              Loading available rooms...
            </span>
          ) : null}

          {approved.length === 0 ? (
            <p className="text-sm text-ink-600">
              There are no approved applications waiting for a room.
            </p>
          ) : null}

          <Button
            type="submit"
            loading={isSubmitting || allocationMutation.isPending}
            loadingLabel="Allocating..."
            disabled={!applicationId}
          >
            Allocate room
          </Button>
        </form>

        <section className="space-y-3">
          {cancelMutation.error ? (
            <FormError
              message={errorInfo(cancelMutation.error).message}
              code={errorInfo(cancelMutation.error).code}
              onRetry={() => void allocationsQuery.refetch()}
              retrying={allocationsQuery.isFetching}
            />
          ) : null}
          <div className="overflow-hidden rounded-lg border border-ink-200 bg-surface shadow-sm">
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
                      <td colSpan={7}>
                        <TableSkeleton rows={5} columns={7} />
                      </td>
                    </tr>
                  ) : null}
                  {allocationsQuery.isError ? (
                    <tr>
                      <td className="px-4 py-4 text-danger-dark" colSpan={7}>
                        <span>We could not load allocations.</span>
                        <button
                          type="button"
                          className="ml-2 font-medium underline"
                          onClick={() => void allocationsQuery.refetch()}
                        >
                          Try again
                        </button>
                      </td>
                    </tr>
                  ) : null}
                  {!allocationsQuery.isLoading && allocations.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState
                          title="No allocations yet"
                          description="Allocate an approved application to create the first allocation."
                          compact
                        />
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
                        {formatDate(allocation.allocation_date)}
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
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        title="Cancel allocation"
        description={
          pendingCancel
            ? `Cancel the allocation for ${pendingCancel.student_name ?? 'this student'} in ${
                pendingCancel.hostel_name ?? 'the hostel'
              } ${pendingCancel.room_number ?? ''}? The bed will be freed and the application returned to approved.`
            : ''
        }
        confirmLabel="Cancel allocation"
        destructive
        loading={cancelMutation.isPending}
        onConfirm={() => void handleConfirmCancel()}
        onCancel={() => {
          if (!cancelMutation.isPending) {
            setPendingCancel(null);
          }
        }}
      />
    </div>
  );
}

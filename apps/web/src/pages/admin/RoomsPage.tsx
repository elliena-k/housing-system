import { zodResolver } from '@hookform/resolvers/zod';
import { createRoomSchema, type CreateRoomInput, type RoomStatus } from '@housing/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { FormError } from '../../components/FormError';
import { Spinner } from '../../components/Spinner';
import { PageHeader } from '../../components/PageHeader';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { TableSkeleton } from '../../components/Skeleton';
import { Toolbar } from '../../components/Toolbar';
import { useToast } from '../../components/Toast';
import { authedFetch } from '../../lib/api';
import { errorInfo } from '../../lib/errors';
import type { Hostel, Room } from '../../lib/types';

const emptyRoom: CreateRoomInput = {
  hostel_id: '',
  room_number: '',
  capacity: 2,
  status: 'available',
};

const numberField = (value: unknown): number | undefined => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const roomStatusStyles: Record<RoomStatus, string> = {
  available: 'border-success bg-success-light text-success-dark',
  occupied: 'border-primary-300 bg-primary-100 text-primary-800',
  maintenance: 'border-warning bg-warning-light text-warning-dark',
};

const roomStatusLabel = (status: RoomStatus): string =>
  status.charAt(0).toUpperCase() + status.slice(1);

export function AdminRoomsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Room | null>(null);
  const [params, setParams] = useSearchParams();
  const hostelId = params.get('hostel') ?? '';
  const statusFilter = params.get('status') ?? '';
  const availableOnly = params.get('available') === '1';

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setParams(next, { replace: true });
  };

  const hostelsQuery = useQuery({
    queryKey: ['hostels'],
    queryFn: () => authedFetch<Hostel[]>('/hostels'),
  });

  const roomsQuery = useQuery({
    queryKey: ['rooms', hostelId, statusFilter, availableOnly],
    queryFn: () => {
      const params = new URLSearchParams();
      if (hostelId) {
        params.set('hostel_id', hostelId);
      }

      if (availableOnly) {
        const query = params.toString();
        return authedFetch<Room[]>(`/admin/rooms/available${query ? `?${query}` : ''}`);
      }

      if (statusFilter) {
        params.set('status', statusFilter);
      }
      const query = params.toString();
      return authedFetch<Room[]>(`/admin/rooms${query ? `?${query}` : ''}`);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoomInput>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: emptyRoom,
  });

  useEffect(() => {
    if (editing) {
      reset({
        hostel_id: editing.hostel_id,
        room_number: editing.room_number,
        capacity: editing.capacity,
        status: editing.status,
      });
      return;
    }

    reset(emptyRoom);
    const hostels = hostelsQuery.data ?? [];
    if (hostels.length > 0 && !getValues('hostel_id')) {
      setValue('hostel_id', hostels[0]?.id ?? '');
    }
  }, [editing, reset, hostelsQuery.data, getValues, setValue]);

  const mutation = useMutation({
    mutationFn: (values: CreateRoomInput) =>
      editing
        ? authedFetch<Room>(`/admin/rooms/${editing.id}`, {
            method: 'PATCH',
            body: {
              room_number: values.room_number,
              capacity: values.capacity,
              status: values.status,
            },
          })
        : authedFetch<Room>('/admin/rooms', { method: 'POST', body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: editing ? 'Room updated' : 'Room added',
        description: editing
          ? 'The room details have been saved.'
          : 'The new room is now available.',
        variant: 'success',
      });
      setEditing(null);
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  const hostels = hostelsQuery.data ?? [];
  const rooms = roomsQuery.data ?? [];
  const hostelNames = new Map(hostels.map((hostel) => [hostel.id, hostel.name]));

  return (
    <div>
      <PageHeader title="Rooms" description="Add rooms, update capacity, and check availability." />

      <Toolbar>
        <div className="w-full sm:w-56">
          <SelectField
            label="Hostel"
            value={hostelId}
            onChange={(event) => updateParam('hostel', event.target.value)}
          >
            <option value="">All hostels</option>
            {hostels.map((hostel) => (
              <option key={hostel.id} value={hostel.id}>
                {hostel.name}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="w-full sm:w-44">
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={(event) => updateParam('status', event.target.value)}
            disabled={availableOnly}
          >
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </SelectField>
        </div>

        <label className="flex min-h-[44px] items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(event) => updateParam('available', event.target.checked ? '1' : '')}
          />
          Available rooms only
        </label>
        {roomsQuery.isFetching && !roomsQuery.isLoading ? (
          <span className="inline-flex items-center gap-1.5 pb-2 text-sm text-ink-500">
            <Spinner className="h-3.5 w-3.5" />
            Updating...
          </span>
        ) : null}
      </Toolbar>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form
          className="space-y-4 rounded-lg border border-ink-200 bg-surface p-5 shadow-sm"
          onSubmit={onSubmit}
          noValidate
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
            {editing ? 'Edit room' : 'Add room'}
          </h2>
          <FormError
            message={mutation.error ? errorInfo(mutation.error).message : null}
            code={mutation.error ? errorInfo(mutation.error).code : undefined}
          />

          <SelectField
            label="Hostel"
            requirement="required"
            error={errors.hostel_id?.message}
            disabled={Boolean(editing)}
            {...register('hostel_id')}
          >
            <option value="">Select hostel</option>
            {hostels.map((hostel) => (
              <option key={hostel.id} value={hostel.id}>
                {hostel.name}
              </option>
            ))}
          </SelectField>

          <TextField
            label="Room number"
            requirement="required"
            hint="Unique within the hostel, for example A101."
            error={errors.room_number?.message}
            {...register('room_number')}
          />
          <TextField
            label="Capacity"
            requirement="required"
            type="number"
            min={1}
            error={errors.capacity?.message}
            {...register('capacity', { setValueAs: numberField })}
          />
          <SelectField
            label="Status"
            requirement="required"
            error={errors.status?.message}
            {...register('status')}
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </SelectField>

          <div className="flex gap-2">
            <Button
              type="submit"
              loading={isSubmitting || mutation.isPending}
              loadingLabel="Saving..."
            >
              {editing ? 'Save changes' : 'Add room'}
            </Button>
            {editing ? (
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        <div className="space-y-3">
          {roomsQuery.isError ? (
            <ErrorState
              message={errorInfo(roomsQuery.error, 'We could not load rooms.').message}
              onRetry={() => void roomsQuery.refetch()}
              retrying={roomsQuery.isFetching}
            />
          ) : null}

          {roomsQuery.isLoading ? (
            <div className="overflow-hidden rounded-lg border border-ink-200 bg-surface shadow-sm">
              <TableSkeleton rows={5} columns={5} />
            </div>
          ) : null}

          {!roomsQuery.isLoading && !roomsQuery.isError && rooms.length === 0 ? (
            <EmptyState
              title="No rooms found"
              description={
                hostelId || statusFilter || availableOnly
                  ? 'No rooms match these filters. Try clearing them.'
                  : 'Add a room to get started.'
              }
              action={
                hostelId || statusFilter || availableOnly ? (
                  <Button
                    variant="secondary"
                    onClick={() => setParams(new URLSearchParams(), { replace: true })}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : null}

          {rooms.length > 0 ? (
            <section className="hidden overflow-hidden rounded-lg border border-ink-200 bg-surface shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-1 text-xs uppercase tracking-wide text-ink-500">
                    <tr>
                      <th className="px-4 py-3">Hostel</th>
                      <th className="px-4 py-3">Room</th>
                      <th className="px-4 py-3">Occupancy</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id} className="border-t border-ink-100">
                        <td className="px-4 py-3 text-ink-600">
                          {hostelNames.get(room.hostel_id) ?? '—'}
                        </td>
                        <td className="px-4 py-3 font-medium text-ink-900">{room.room_number}</td>
                        <td className="px-4 py-3 text-ink-600">
                          {room.occupancy} / {room.capacity}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${roomStatusStyles[room.status]}`}
                          >
                            {roomStatusLabel(room.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            className="text-sm font-medium text-primary underline"
                            onClick={() => setEditing(room)}
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
          ) : null}

          {rooms.length > 0 ? (
            <div className="space-y-3 md:hidden">
              {rooms.map((room) => (
                <article
                  key={room.id}
                  className="rounded-lg border border-ink-200 bg-surface p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-ink-900">
                        {hostelNames.get(room.hostel_id) ?? 'Unknown hostel'}
                      </p>
                      <p className="text-sm text-ink-600">Room {room.room_number}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${roomStatusStyles[room.status]}`}
                    >
                      {roomStatusLabel(room.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink-600">
                    Occupancy: {room.occupancy} / {room.capacity}
                  </p>
                  <Button className="mt-3" variant="secondary" onClick={() => setEditing(room)}>
                    Edit room
                  </Button>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

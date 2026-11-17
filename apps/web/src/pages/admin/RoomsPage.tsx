import { zodResolver } from '@hookform/resolvers/zod';
import { createRoomSchema, type CreateRoomInput, type RoomStatus } from '@housing/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { PageHeader } from '../../components/PageHeader';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { authedFetch } from '../../lib/api';
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
  const [editing, setEditing] = useState<Room | null>(null);
  const [hostelId, setHostelId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

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

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-ink-200 bg-surface p-4 shadow-sm">
        <label className="space-y-1 text-sm text-ink-700">
          <span className="block font-medium">Hostel</span>
          <select
            className="min-h-[44px] rounded-md border border-ink-300 bg-surface px-3 py-2 text-sm"
            value={hostelId}
            onChange={(event) => setHostelId(event.target.value)}
          >
            <option value="">All hostels</option>
            {hostels.map((hostel) => (
              <option key={hostel.id} value={hostel.id}>
                {hostel.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm text-ink-700">
          <span className="block font-medium">Status</span>
          <select
            className="min-h-[44px] rounded-md border border-ink-300 bg-surface px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            disabled={availableOnly}
          >
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </label>

        <label className="flex min-h-[44px] items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(event) => setAvailableOnly(event.target.checked)}
          />
          Available rooms only
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form
          className="space-y-4 rounded-lg border border-ink-200 bg-surface p-5 shadow-sm"
          onSubmit={onSubmit}
          noValidate
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
            {editing ? 'Edit room' : 'Add room'}
          </h2>
          <FormError message={mutation.error instanceof Error ? mutation.error.message : null} />

          <SelectField
            label="Hostel"
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
            error={errors.room_number?.message}
            {...register('room_number')}
          />
          <TextField
            label="Capacity"
            type="number"
            min={1}
            error={errors.capacity?.message}
            {...register('capacity', { setValueAs: numberField })}
          />
          <SelectField label="Status" error={errors.status?.message} {...register('status')}>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </SelectField>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {editing ? 'Save changes' : 'Add room'}
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
                  <th className="px-4 py-3">Hostel</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Occupancy</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {roomsQuery.isLoading ? (
                  <tr>
                    <td className="px-4 py-4 text-ink-600" colSpan={5}>
                      Loading rooms...
                    </td>
                  </tr>
                ) : null}
                {roomsQuery.isError ? (
                  <tr>
                    <td className="px-4 py-4 text-danger-dark" colSpan={5}>
                      Could not load rooms.
                    </td>
                  </tr>
                ) : null}
                {!roomsQuery.isLoading && rooms.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-ink-600" colSpan={5}>
                      No rooms match these filters.
                    </td>
                  </tr>
                ) : null}
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
      </div>
    </div>
  );
}

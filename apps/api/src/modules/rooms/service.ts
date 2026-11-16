import type { CreateRoomInput, RoomStatus, UpdateRoomInput } from '@housing/shared';
import { getSupabaseAdmin } from '../../config/supabase.js';
import type { RoomRow } from '../../types/rows.js';
import { AppError } from '../../utils/AppError.js';

export interface RoomFilters {
  hostel_id?: string;
  status?: RoomStatus;
}

export async function listRooms(filters: RoomFilters): Promise<RoomRow[]> {
  const admin = getSupabaseAdmin();
  let query = admin.from('rooms').select('*').order('room_number');

  if (filters.hostel_id) {
    query = query.eq('hostel_id', filters.hostel_id);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError(500, 'ROOMS_LOOKUP_FAILED', 'Could not load rooms.');
  }

  return (data ?? []) as RoomRow[];
}

export async function listAvailableRooms(hostelId?: string): Promise<RoomRow[]> {
  const admin = getSupabaseAdmin();
  let query = admin.from('rooms').select('*').neq('status', 'maintenance').order('room_number');

  if (hostelId) {
    query = query.eq('hostel_id', hostelId);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError(500, 'ROOMS_LOOKUP_FAILED', 'Could not load available rooms.');
  }

  // A room only has free space when occupancy is below capacity. The database
  // also enforces this bound, but the comparison cannot be expressed in a
  // simple PostgREST filter.
  return ((data ?? []) as RoomRow[]).filter((room) => room.occupancy < room.capacity);
}

export async function createRoom(input: CreateRoomInput): Promise<RoomRow> {
  const admin = getSupabaseAdmin();
  const { data: hostel, error: hostelError } = await admin
    .from('hostels')
    .select('id')
    .eq('id', input.hostel_id)
    .maybeSingle();

  if (hostelError) {
    throw new AppError(500, 'ROOM_CREATE_FAILED', 'Could not check the hostel.');
  }
  if (!hostel) {
    throw new AppError(404, 'HOSTEL_NOT_FOUND', 'That hostel was not found.');
  }

  const { data, error } = await admin
    .from('rooms')
    .insert({ ...input, occupancy: 0 })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new AppError(
        409,
        'ROOM_NUMBER_TAKEN',
        'That room number already exists in this hostel.'
      );
    }
    if (error.code === '23503') {
      throw new AppError(404, 'HOSTEL_NOT_FOUND', 'That hostel was not found.');
    }
    throw new AppError(500, 'ROOM_CREATE_FAILED', 'Could not add the room.');
  }

  return data as RoomRow;
}

export async function updateRoom(id: string, input: UpdateRoomInput): Promise<RoomRow> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('rooms')
    .update(input)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    if (error.code === '23505') {
      throw new AppError(
        409,
        'ROOM_NUMBER_TAKEN',
        'That room number already exists in this hostel.'
      );
    }
    if (error.code === '23514') {
      throw new AppError(
        409,
        'CAPACITY_BELOW_OCCUPANCY',
        'Capacity cannot be lower than the number of occupants.'
      );
    }
    throw new AppError(500, 'ROOM_UPDATE_FAILED', 'Could not update the room.');
  }

  if (!data) {
    throw new AppError(404, 'ROOM_NOT_FOUND', 'That room was not found.');
  }

  return data as RoomRow;
}

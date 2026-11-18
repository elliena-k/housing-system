import type { CreateAllocationInput } from '@housing/shared';
import { getSupabaseAdmin } from '../../config/supabase.js';
import type { AllocationListItem, AllocationRow } from '../../types/rows.js';
import { AppError } from '../../utils/AppError.js';

interface StudentSummary {
  id: string;
  first_name: string;
  last_name: string;
  matric_no: string;
}

interface HostelSummary {
  id: string;
  name: string;
}

interface RoomSummary {
  id: string;
  room_number: string;
}

type DatabaseError = { message?: string; code?: string };

export function mapAllocationError(error: DatabaseError): AppError {
  const message = error.message ?? '';

  const mappings: ReadonlyArray<readonly [string, number, string, string]> = [
    [
      'APPLICATION_NOT_FOUND',
      404,
      'APPLICATION_NOT_FOUND',
      'That application was not found. Refresh the list and try again.',
    ],
    [
      'APPLICATION_NOT_APPROVED',
      409,
      'APPLICATION_NOT_APPROVED',
      'Only approved applications can be allocated. Approve the application first.',
    ],
    [
      'ROOM_NOT_FOUND',
      404,
      'ROOM_NOT_FOUND',
      'That room was not found. Refresh the list and try again.',
    ],
    [
      'ROOM_UNAVAILABLE',
      409,
      'ROOM_UNAVAILABLE',
      'That room is full or unavailable. Choose another room.',
    ],
    [
      'HOSTEL_INACTIVE',
      409,
      'HOSTEL_INACTIVE',
      'That hostel is inactive. Choose an active hostel.',
    ],
    [
      'GENDER_MISMATCH',
      409,
      'GENDER_MISMATCH',
      'This hostel does not match the student gender. Choose a compatible hostel.',
    ],
    [
      'ALLOCATION_NOT_FOUND',
      404,
      'ALLOCATION_NOT_FOUND',
      'That allocation was not found. Refresh the list and try again.',
    ],
    [
      'ALLOCATION_NOT_ACTIVE',
      409,
      'ALLOCATION_NOT_ACTIVE',
      'This allocation is already cancelled.',
    ],
  ];

  for (const [token, status, code, text] of mappings) {
    if (message.includes(token)) {
      return new AppError(status, code, text);
    }
  }

  if (error.code === '23505') {
    return new AppError(
      409,
      'ALREADY_ALLOCATED',
      'This student already has an active allocation. Cancel it before allocating another room.'
    );
  }

  return new AppError(
    500,
    'ALLOCATION_FAILED',
    'We could not complete the allocation. Please try again.'
  );
}

export async function allocateRoom(
  input: CreateAllocationInput,
  adminId: string
): Promise<AllocationRow> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.rpc('allocate_room', {
    p_application_id: input.application_id,
    p_room_id: input.room_id,
    p_admin_id: adminId,
  });

  if (error) {
    throw mapAllocationError(error);
  }

  return data as AllocationRow;
}

export async function cancelAllocation(id: string, adminId: string): Promise<AllocationRow> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.rpc('cancel_allocation', {
    p_allocation_id: id,
    p_admin_id: adminId,
  });

  if (error) {
    throw mapAllocationError(error);
  }

  return data as AllocationRow;
}

export async function listAllocations(): Promise<AllocationListItem[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('allocations')
    .select('*')
    .order('allocation_date', { ascending: false });

  if (error) {
    throw new AppError(
      500,
      'ALLOCATIONS_LOOKUP_FAILED',
      'We could not load allocations. Please try again.'
    );
  }

  const rows = (data ?? []) as AllocationRow[];
  if (rows.length === 0) {
    return [];
  }

  const studentIds = [...new Set(rows.map((row) => row.student_id))];
  const hostelIds = [...new Set(rows.map((row) => row.hostel_id))];
  const roomIds = [...new Set(rows.map((row) => row.room_id))];

  const [studentsResult, hostelsResult, roomsResult] = await Promise.all([
    admin.from('students').select('id, first_name, last_name, matric_no').in('id', studentIds),
    admin.from('hostels').select('id, name').in('id', hostelIds),
    admin.from('rooms').select('id, room_number').in('id', roomIds),
  ]);

  if (studentsResult.error || hostelsResult.error || roomsResult.error) {
    throw new AppError(
      500,
      'ALLOCATIONS_LOOKUP_FAILED',
      'We could not load allocation details. Please try again.'
    );
  }

  const students = new Map(
    ((studentsResult.data ?? []) as StudentSummary[]).map((student) => [student.id, student])
  );
  const hostels = new Map(
    ((hostelsResult.data ?? []) as HostelSummary[]).map((hostel) => [hostel.id, hostel])
  );
  const rooms = new Map(((roomsResult.data ?? []) as RoomSummary[]).map((room) => [room.id, room]));

  return rows.map((row) => {
    const student = students.get(row.student_id);
    return {
      ...row,
      student_name: student ? `${student.first_name} ${student.last_name}` : null,
      matric_no: student?.matric_no ?? null,
      hostel_name: hostels.get(row.hostel_id)?.name ?? null,
      room_number: rooms.get(row.room_id)?.room_number ?? null,
    };
  });
}

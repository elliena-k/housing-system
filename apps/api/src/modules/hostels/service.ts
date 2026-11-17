import type { CreateHostelInput, UpdateHostelInput } from '@housing/shared';
import { getSupabaseAdmin } from '../../config/supabase.js';
import type { HostelRow } from '../../types/rows.js';
import { AppError } from '../../utils/AppError.js';

export async function listHostels(): Promise<HostelRow[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from('hostels').select('*').order('name');

  if (error) {
    throw new AppError(500, 'HOSTELS_LOOKUP_FAILED', 'Could not load hostels.');
  }

  return (data ?? []) as HostelRow[];
}

export async function createHostel(input: CreateHostelInput): Promise<HostelRow> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from('hostels').insert(input).select('*').single();

  if (error) {
    if (error.code === '23505') {
      throw new AppError(409, 'HOSTEL_NAME_TAKEN', 'A hostel with that name already exists.');
    }
    throw new AppError(500, 'HOSTEL_CREATE_FAILED', 'Could not add the hostel.');
  }

  return data as HostelRow;
}

export async function updateHostel(id: string, input: UpdateHostelInput): Promise<HostelRow> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('hostels')
    .update(input)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    if (error.code === '23505') {
      throw new AppError(409, 'HOSTEL_NAME_TAKEN', 'A hostel with that name already exists.');
    }
    throw new AppError(500, 'HOSTEL_UPDATE_FAILED', 'Could not update the hostel.');
  }

  if (!data) {
    throw new AppError(404, 'HOSTEL_NOT_FOUND', 'That hostel was not found.');
  }

  return data as HostelRow;
}

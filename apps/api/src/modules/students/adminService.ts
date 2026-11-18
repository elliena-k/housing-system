import type { StudentSearch } from '@housing/shared';
import { getSupabaseAdmin } from '../../config/supabase.js';
import type { StudentRow } from '../../types/rows.js';
import { AppError } from '../../utils/AppError.js';
import { sanitiseSearch } from '../../utils/search.js';

export async function searchStudents(input: StudentSearch): Promise<StudentRow[]> {
  const admin = getSupabaseAdmin();
  const search = input.q ? sanitiseSearch(input.q) : '';
  let query = admin
    .from('students')
    .select('*')
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .limit(100);

  if (search) {
    query = query.or(
      `matric_no.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError(
      500,
      'STUDENTS_LOOKUP_FAILED',
      'We could not load students. Please try again.'
    );
  }

  return (data ?? []) as StudentRow[];
}

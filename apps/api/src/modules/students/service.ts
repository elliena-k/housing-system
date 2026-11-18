import type { UpdateStudentInput } from '@housing/shared';
import { getSupabaseAdmin } from '../../config/supabase.js';
import type { StudentRow } from '../../types/rows.js';
import { AppError } from '../../utils/AppError.js';

export async function getStudentForUser(userId: string): Promise<StudentRow | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new AppError(
      500,
      'STUDENT_LOOKUP_FAILED',
      'We could not load your student record. Please try again.'
    );
  }

  return (data as StudentRow | null) ?? null;
}

export async function requireStudentForUser(userId: string): Promise<StudentRow> {
  const student = await getStudentForUser(userId);
  if (!student) {
    throw new AppError(
      404,
      'STUDENT_NOT_FOUND',
      'Your student profile was not found. Contact the administrator if this is unexpected.'
    );
  }
  return student;
}

export async function updateStudentForUser(
  userId: string,
  input: UpdateStudentInput
): Promise<StudentRow> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('students')
    .update(input)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle();

  if (error) {
    if (error.code === '23505') {
      throw new AppError(
        409,
        'STUDENT_DETAILS_TAKEN',
        'Those details are already in use. Check your matriculation number and email.'
      );
    }
    throw new AppError(
      500,
      'STUDENT_UPDATE_FAILED',
      'We could not update your profile. Please try again.'
    );
  }

  const student = data as StudentRow | null;
  if (!student) {
    throw new AppError(
      404,
      'STUDENT_NOT_FOUND',
      'Your student profile was not found. Contact the administrator if this is unexpected.'
    );
  }
  return student;
}

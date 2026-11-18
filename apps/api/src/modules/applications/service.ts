import type { CreateApplicationInput } from '@housing/shared';
import { env } from '../../config/env.js';
import { getSupabaseAdmin } from '../../config/supabase.js';
import type { ApplicationRow, StudentRow } from '../../types/rows.js';
import { AppError } from '../../utils/AppError.js';
import { getStudentForUser } from '../students/service.js';

function assertProfileComplete(student: StudentRow): void {
  const required = [
    student.first_name,
    student.last_name,
    student.matric_no,
    student.faculty,
    student.department,
    student.gender,
  ];

  if (required.some((value) => !value) || !student.level) {
    throw new AppError(
      422,
      'PROFILE_INCOMPLETE',
      'Complete your student profile before applying. Add your faculty, department, and level first.'
    );
  }
}

export async function createApplication(
  userId: string,
  input: CreateApplicationInput
): Promise<ApplicationRow> {
  if (input.session !== env.OPEN_SESSION) {
    throw new AppError(
      422,
      'SESSION_CLOSED',
      `Applications are only open for ${env.OPEN_SESSION}.`
    );
  }

  const student = await getStudentForUser(userId);
  if (!student) {
    throw new AppError(
      403,
      'PROFILE_MISSING',
      'Create your student profile before applying. Contact the administrator if you need help.'
    );
  }
  assertProfileComplete(student);

  const admin = getSupabaseAdmin();
  const [{ data: existing, error: existingError }, { data: allocation, error: allocationError }] =
    await Promise.all([
      admin
        .from('housing_applications')
        .select('id')
        .eq('student_id', student.id)
        .eq('session', input.session)
        .maybeSingle(),
      admin
        .from('allocations')
        .select('id')
        .eq('student_id', student.id)
        .eq('status', 'active')
        .maybeSingle(),
    ]);

  if (existingError || allocationError) {
    throw new AppError(
      500,
      'APPLICATION_CHECK_FAILED',
      'We could not check your eligibility. Please try again.'
    );
  }
  if (existing) {
    throw new AppError(
      409,
      'APPLICATION_EXISTS',
      'You have already applied for this session. Check the status of your application.'
    );
  }
  if (allocation) {
    throw new AppError(
      409,
      'ALREADY_ALLOCATED',
      'You already hold a room allocation. View it on your dashboard.'
    );
  }

  const { data, error } = await admin
    .from('housing_applications')
    .insert({
      student_id: student.id,
      session: input.session,
      preference: input.preference ?? null,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new AppError(
        409,
        'APPLICATION_EXISTS',
        'You have already applied for this session. Check the status of your application.'
      );
    }
    throw new AppError(
      500,
      'APPLICATION_FAILED',
      'We could not submit your application. Please try again.'
    );
  }

  return data as ApplicationRow;
}

export async function listMyApplications(userId: string): Promise<ApplicationRow[]> {
  const student = await getStudentForUser(userId);
  if (!student) {
    throw new AppError(
      404,
      'STUDENT_NOT_FOUND',
      'Your student profile was not found. Contact the administrator if this is unexpected.'
    );
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('housing_applications')
    .select('*')
    .eq('student_id', student.id)
    .order('application_date', { ascending: false });

  if (error) {
    throw new AppError(
      500,
      'APPLICATIONS_LOOKUP_FAILED',
      'We could not load your applications. Please try again.'
    );
  }

  return (data ?? []) as ApplicationRow[];
}

export async function getMyApplication(userId: string, id: string): Promise<ApplicationRow> {
  const student = await getStudentForUser(userId);
  if (!student) {
    throw new AppError(
      404,
      'STUDENT_NOT_FOUND',
      'Your student profile was not found. Contact the administrator if this is unexpected.'
    );
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('housing_applications')
    .select('*')
    .eq('id', id)
    .eq('student_id', student.id)
    .maybeSingle();

  if (error) {
    throw new AppError(
      500,
      'APPLICATION_LOOKUP_FAILED',
      'We could not load that application. Please try again.'
    );
  }
  if (!data) {
    throw new AppError(
      404,
      'APPLICATION_NOT_FOUND',
      'That application was not found. Refresh the list and try again.'
    );
  }

  return data as ApplicationRow;
}

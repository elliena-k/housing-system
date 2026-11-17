import type { AdminApplicationFilter, ReviewApplicationInput } from '@housing/shared';
import { getSupabaseAdmin } from '../../config/supabase.js';
import type { ApplicationRow, ApplicationWithStudent, StudentRow } from '../../types/rows.js';
import { AppError } from '../../utils/AppError.js';
import { sanitiseSearch } from '../../utils/search.js';

async function studentsByIds(ids: string[]): Promise<Map<string, StudentRow>> {
  if (ids.length === 0) {
    return new Map();
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from('students').select('*').in('id', ids);

  if (error) {
    throw new AppError(500, 'STUDENTS_LOOKUP_FAILED', 'Could not load student details.');
  }

  return new Map(((data ?? []) as StudentRow[]).map((student) => [student.id, student]));
}

async function attachStudent(application: ApplicationRow): Promise<ApplicationWithStudent> {
  const students = await studentsByIds([application.student_id]);
  return { ...application, student: students.get(application.student_id) ?? null };
}

export async function listApplications(
  filters: AdminApplicationFilter
): Promise<ApplicationWithStudent[]> {
  const admin = getSupabaseAdmin();
  const search = filters.q ? sanitiseSearch(filters.q) : '';
  let studentIds: string[] | null = null;

  if (search) {
    const { data, error } = await admin
      .from('students')
      .select('id')
      .or(`matric_no.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
      .limit(200);

    if (error) {
      throw new AppError(500, 'STUDENTS_LOOKUP_FAILED', 'Could not search students.');
    }

    studentIds = ((data ?? []) as { id: string }[]).map((row) => row.id);
    if (studentIds.length === 0) {
      return [];
    }
  }

  let query = admin
    .from('housing_applications')
    .select('*')
    .order('application_date', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.session) {
    query = query.eq('session', filters.session);
  }
  if (studentIds) {
    query = query.in('student_id', studentIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError(500, 'APPLICATIONS_LOOKUP_FAILED', 'Could not load applications.');
  }

  const applications = (data ?? []) as ApplicationRow[];
  const students = await studentsByIds([
    ...new Set(applications.map((application) => application.student_id)),
  ]);

  return applications.map((application) => ({
    ...application,
    student: students.get(application.student_id) ?? null,
  }));
}

export async function getApplicationForAdmin(id: string): Promise<ApplicationWithStudent> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('housing_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new AppError(500, 'APPLICATION_LOOKUP_FAILED', 'Could not load that application.');
  }
  if (!data) {
    throw new AppError(404, 'APPLICATION_NOT_FOUND', 'That application was not found.');
  }

  return attachStudent(data as ApplicationRow);
}

export async function reviewApplication(
  id: string,
  input: ReviewApplicationInput,
  adminId: string
): Promise<ApplicationWithStudent> {
  const admin = getSupabaseAdmin();
  const { data: current, error: currentError } = await admin
    .from('housing_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (currentError) {
    throw new AppError(500, 'APPLICATION_LOOKUP_FAILED', 'Could not load that application.');
  }
  if (!current) {
    throw new AppError(404, 'APPLICATION_NOT_FOUND', 'That application was not found.');
  }

  const application = current as ApplicationRow;
  if (application.status !== 'pending') {
    throw new AppError(
      409,
      'INVALID_STATUS_TRANSITION',
      'Only pending applications can be reviewed.'
    );
  }

  const { data, error } = await admin
    .from('housing_applications')
    .update({
      status: input.status,
      remarks: input.remarks ?? null,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new AppError(500, 'APPLICATION_REVIEW_FAILED', 'Could not review the application.');
  }

  await admin.from('audit_logs').insert({
    actor_id: adminId,
    action: `application.${input.status}`,
    entity: 'housing_application',
    entity_id: id,
    details: { remarks: input.remarks ?? null },
  });

  return attachStudent(data as ApplicationRow);
}

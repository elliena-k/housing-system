import type { RegisterInput, UserRole } from '@housing/shared';
import { getSupabaseAdmin } from '../../config/supabase.js';
import type { StudentRow } from '../../types/rows.js';
import { AppError } from '../../utils/AppError.js';

export interface RegisteredAccount {
  user: { id: string; role: UserRole };
  student: StudentRow;
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === '23505';
}

export async function registerStudent(input: RegisterInput): Promise<RegisteredAccount> {
  const admin = getSupabaseAdmin();
  const email = input.email.toLowerCase();

  const { data: matricMatch, error: matricError } = await admin
    .from('students')
    .select('id')
    .eq('matric_no', input.matric_no)
    .maybeSingle();

  if (matricError) {
    throw new AppError(500, 'REGISTRATION_FAILED', 'Could not check your details.');
  }
  if (matricMatch) {
    throw new AppError(409, 'MATRIC_TAKEN', 'That matriculation number is already registered.');
  }

  const { data: emailMatch, error: emailError } = await admin
    .from('students')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (emailError) {
    throw new AppError(500, 'REGISTRATION_FAILED', 'Could not check your details.');
  }
  if (emailMatch) {
    throw new AppError(409, 'EMAIL_TAKEN', 'That email address is already registered.');
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    if (createError?.code === 'email_exists' || isUniqueViolation(createError)) {
      throw new AppError(409, 'EMAIL_TAKEN', 'That email address is already registered.');
    }
    throw new AppError(500, 'REGISTRATION_FAILED', 'Could not create your account.');
  }

  const userId = created.user.id;

  try {
    const { error: profileError } = await admin.from('profiles').insert({
      id: userId,
      role: 'student',
    });

    if (profileError) {
      throw new AppError(500, 'REGISTRATION_FAILED', 'Could not create your profile.');
    }

    const { data: student, error: studentError } = await admin
      .from('students')
      .insert({
        user_id: userId,
        matric_no: input.matric_no,
        first_name: input.first_name,
        last_name: input.last_name,
        gender: input.gender,
        faculty: input.faculty,
        department: input.department,
        level: input.level,
        phone: input.phone ?? null,
        email,
      })
      .select('*')
      .single();

    if (studentError || !student) {
      if (isUniqueViolation(studentError)) {
        throw new AppError(
          409,
          'STUDENT_DETAILS_TAKEN',
          'Those student details are already registered.'
        );
      }
      throw new AppError(500, 'REGISTRATION_FAILED', 'Could not save your student details.');
    }

    return {
      user: { id: userId, role: 'student' },
      student: student as StudentRow,
    };
  } catch (error) {
    await admin.auth.admin.deleteUser(userId);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'REGISTRATION_FAILED', 'Could not complete registration.');
  }
}

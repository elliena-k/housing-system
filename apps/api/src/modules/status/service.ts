import { getSupabaseAdmin } from '../../config/supabase.js';
import type {
  AllocationDetails,
  AllocationRow,
  ApplicationRow,
  StudentRow,
} from '../../types/rows.js';
import { AppError } from '../../utils/AppError.js';
import { getStudentForUser } from '../students/service.js';

export interface StudentStatus {
  student: StudentRow;
  application: ApplicationRow | null;
  allocation: AllocationDetails | null;
}

export async function getMyStatus(userId: string): Promise<StudentStatus> {
  const student = await getStudentForUser(userId);
  if (!student) {
    throw new AppError(404, 'STUDENT_NOT_FOUND', 'Your student profile was not found.');
  }

  const admin = getSupabaseAdmin();
  const { data: application, error: applicationError } = await admin
    .from('housing_applications')
    .select('*')
    .eq('student_id', student.id)
    .order('application_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (applicationError) {
    throw new AppError(500, 'STATUS_LOOKUP_FAILED', 'Could not load your application status.');
  }

  const { data: allocation, error: allocationError } = await admin
    .from('allocations')
    .select('*')
    .eq('student_id', student.id)
    .eq('status', 'active')
    .maybeSingle();

  if (allocationError) {
    throw new AppError(500, 'STATUS_LOOKUP_FAILED', 'Could not load your allocation.');
  }

  let allocationDetails: AllocationDetails | null = null;
  if (allocation) {
    const row = allocation as AllocationRow;
    const [{ data: hostel }, { data: room }] = await Promise.all([
      admin.from('hostels').select('name').eq('id', row.hostel_id).maybeSingle(),
      admin.from('rooms').select('room_number').eq('id', row.room_id).maybeSingle(),
    ]);

    allocationDetails = {
      ...row,
      hostel_name: (hostel as { name: string } | null)?.name ?? null,
      room_number: (room as { room_number: string } | null)?.room_number ?? null,
    };
  }

  return {
    student,
    application: (application as ApplicationRow | null) ?? null,
    allocation: allocationDetails,
  };
}

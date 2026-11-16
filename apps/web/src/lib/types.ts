import type { AllocationStatus, ApplicationStatus, Gender, Level, UserRole } from '@housing/shared';

export interface Student {
  id: string;
  user_id: string;
  matric_no: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  faculty: string;
  department: string;
  level: Level;
  phone: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  student_id: string;
  session: string;
  preference: string | null;
  status: ApplicationStatus;
  remarks: string | null;
  application_date: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export interface AllocationDetails {
  id: string;
  hostel_id: string;
  room_id: string;
  allocation_date: string;
  status: AllocationStatus;
  hostel_name: string | null;
  room_number: string | null;
}

export interface AppUser {
  id: string;
  role: UserRole;
  isActive: boolean;
}

export interface MyAccount {
  user: AppUser;
  student: Student | null;
  session: string;
}

export interface StudentStatus {
  student: Student;
  application: Application | null;
  allocation: AllocationDetails | null;
}

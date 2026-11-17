import type { ApplicationStatus } from '@housing/shared';
import { getSupabaseAdmin } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';

export interface AdminStats {
  applications: Record<ApplicationStatus, number>;
  roomsAvailable: number;
  activeAllocations: number;
  totalStudents: number;
}

const statuses: ApplicationStatus[] = ['pending', 'approved', 'rejected', 'allocated', 'cancelled'];

export async function getAdminStats(): Promise<AdminStats> {
  const admin = getSupabaseAdmin();

  const counts = await Promise.all(
    statuses.map(async (status) => {
      const { count, error } = await admin
        .from('housing_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      if (error) {
        throw new AppError(500, 'STATS_LOOKUP_FAILED', 'Could not load statistics.');
      }

      return [status, count ?? 0] as const;
    })
  );

  const [roomsResult, allocationsResult, studentsResult] = await Promise.all([
    admin.from('rooms').select('capacity, occupancy, status'),
    admin.from('allocations').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('students').select('*', { count: 'exact', head: true }),
  ]);

  if (roomsResult.error || allocationsResult.error || studentsResult.error) {
    throw new AppError(500, 'STATS_LOOKUP_FAILED', 'Could not load statistics.');
  }

  const rooms = (roomsResult.data ?? []) as {
    capacity: number;
    occupancy: number;
    status: string;
  }[];

  return {
    applications: Object.fromEntries(counts) as Record<ApplicationStatus, number>,
    roomsAvailable: rooms.filter(
      (room) => room.status !== 'maintenance' && room.occupancy < room.capacity
    ).length,
    activeAllocations: allocationsResult.count ?? 0,
    totalStudents: studentsResult.count ?? 0,
  };
}

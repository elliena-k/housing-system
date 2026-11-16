import { z } from 'zod';

export const userRoleSchema = z.enum(['student', 'admin']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const applicationStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'allocated',
  'cancelled',
]);
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export const roomStatusSchema = z.enum(['available', 'occupied', 'maintenance']);
export type RoomStatus = z.infer<typeof roomStatusSchema>;

export const hostelStatusSchema = z.enum(['active', 'inactive']);
export type HostelStatus = z.infer<typeof hostelStatusSchema>;

export const allocationStatusSchema = z.enum(['active', 'cancelled']);
export type AllocationStatus = z.infer<typeof allocationStatusSchema>;

export const genderSchema = z.enum(['male', 'female']);
export type Gender = z.infer<typeof genderSchema>;

export const hostelGenderTypeSchema = z.enum(['male', 'female', 'mixed']);
export type HostelGenderType = z.infer<typeof hostelGenderTypeSchema>;

export const levelSchema = z.union([
  z.literal(100),
  z.literal(200),
  z.literal(300),
  z.literal(400),
  z.literal(500),
  z.literal(600),
]);
export type Level = z.infer<typeof levelSchema>;

export const sessionSchema = z.string().regex(/^\d{4}\/\d{4}$/, 'Session must look like 2026/2027');
export type Session = z.infer<typeof sessionSchema>;

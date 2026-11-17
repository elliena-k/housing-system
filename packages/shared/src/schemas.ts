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

const nameField = z.string().trim().min(1, 'This field is required.').max(80);
const emailField = z.string().trim().email('Enter a valid email address.');

export const registerSchema = z.object({
  first_name: nameField,
  last_name: nameField,
  matric_no: z
    .string()
    .trim()
    .min(3, 'Enter a valid matriculation number.')
    .max(20, 'Enter a valid matriculation number.')
    .regex(/^[A-Za-z0-9/-]+$/, 'Enter a valid matriculation number.'),
  faculty: z.string().trim().min(2, 'This field is required.').max(120),
  department: z.string().trim().min(2, 'This field is required.').max(120),
  level: z.coerce.number().pipe(levelSchema),
  gender: genderSchema,
  email: emailField,
  password: z.string().min(8, 'Password must be at least 8 characters.').max(72),
  phone: z.string().trim().max(20).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Enter your password.'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const updateStudentSchema = z
  .object({
    first_name: nameField.optional(),
    last_name: nameField.optional(),
    gender: genderSchema.optional(),
    faculty: z.string().trim().min(2).max(120).optional(),
    department: z.string().trim().min(2).max(120).optional(),
    level: z.coerce.number().pipe(levelSchema).optional(),
    phone: z.string().trim().max(20).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update.',
  });
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export const createApplicationSchema = z.object({
  session: sessionSchema,
  preference: z.string().trim().max(200).optional(),
});
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const createHostelSchema = z.object({
  name: z.string().trim().min(2, 'Enter the hostel name.').max(120),
  location: z.string().trim().max(120).optional(),
  capacity: z.coerce.number().int().positive().optional(),
  gender_type: hostelGenderTypeSchema.optional(),
  status: hostelStatusSchema.optional(),
});
export type CreateHostelInput = z.infer<typeof createHostelSchema>;

export const updateHostelSchema = createHostelSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update.',
  });
export type UpdateHostelInput = z.infer<typeof updateHostelSchema>;

export const createRoomSchema = z.object({
  hostel_id: z.string().uuid('Choose a hostel.'),
  room_number: z.string().trim().min(1, 'Enter the room number.').max(30),
  capacity: z.coerce.number().int().positive().max(50),
  status: roomStatusSchema.optional(),
});
export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export const updateRoomSchema = z
  .object({
    room_number: z.string().trim().min(1).max(30).optional(),
    capacity: z.coerce.number().int().positive().max(50).optional(),
    status: roomStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update.',
  });
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;

export const reviewApplicationSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  remarks: z.string().trim().max(500).optional(),
});
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;

export const createAllocationSchema = z.object({
  application_id: z.string().uuid('Choose an application.'),
  room_id: z.string().uuid('Choose a room.'),
});
export type CreateAllocationInput = z.infer<typeof createAllocationSchema>;

export const adminApplicationFilterSchema = z.object({
  status: applicationStatusSchema.optional(),
  session: z
    .string()
    .regex(/^\d{4}\/\d{4}$/, 'Session must look like 2026/2027')
    .optional(),
  q: z.string().trim().max(80).optional(),
});
export type AdminApplicationFilter = z.infer<typeof adminApplicationFilterSchema>;

export const studentSearchSchema = z.object({
  q: z.string().trim().max(80).optional(),
});
export type StudentSearch = z.infer<typeof studentSearchSchema>;

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

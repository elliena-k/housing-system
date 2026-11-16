import { createApplicationSchema, registerSchema } from '@housing/shared';
import { describe, expect, it } from 'vitest';

const validRegistration = {
  first_name: 'Ada',
  last_name: 'Okafor',
  matric_no: 'UI/2023/1042',
  faculty: 'Science',
  department: 'Computer Science',
  level: 300,
  gender: 'female',
  email: 'ada.okafor@example.com',
  password: 'correct-horse',
  phone: '08012345678',
};

describe('registerSchema', () => {
  it('accepts a complete registration', () => {
    const result = registerSchema.safeParse(validRegistration);
    expect(result.success).toBe(true);
  });

  it('rejects a short password', () => {
    const result = registerSchema.safeParse({ ...validRegistration, password: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid matriculation number', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      matric_no: 'UI 2023 1042!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid level', () => {
    const result = registerSchema.safeParse({ ...validRegistration, level: 700 });
    expect(result.success).toBe(false);
  });
});

describe('createApplicationSchema', () => {
  it('accepts a valid session', () => {
    const result = createApplicationSchema.safeParse({ session: '2026/2027' });
    expect(result.success).toBe(true);
  });

  it('rejects a malformed session', () => {
    const result = createApplicationSchema.safeParse({ session: '2026-2027' });
    expect(result.success).toBe(false);
  });
});

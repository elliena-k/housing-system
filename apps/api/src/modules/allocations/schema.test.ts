import {
  adminApplicationFilterSchema,
  createAllocationSchema,
  reviewApplicationSchema,
} from '@housing/shared';
import { describe, expect, it } from 'vitest';

const applicationId = '7f1c2a3b-4d5e-4f60-8a9b-0c1d2e3f4a5b';
const roomId = '2c3d4e5f-6a7b-4c8d-9e0f-1a2b3c4d5e6f';

describe('reviewApplicationSchema', () => {
  it('accepts an approval with remarks', () => {
    const result = reviewApplicationSchema.safeParse({
      status: 'approved',
      remarks: 'Eligible for accommodation.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an unsupported decision', () => {
    const result = reviewApplicationSchema.safeParse({ status: 'pending' });
    expect(result.success).toBe(false);
  });

  it('rejects remarks over 500 characters', () => {
    const result = reviewApplicationSchema.safeParse({
      status: 'rejected',
      remarks: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe('createAllocationSchema', () => {
  it('accepts valid identifiers', () => {
    const result = createAllocationSchema.safeParse({
      application_id: applicationId,
      room_id: roomId,
    });
    expect(result.success).toBe(true);
  });

  it('rejects malformed identifiers', () => {
    const result = createAllocationSchema.safeParse({
      application_id: 'not-a-uuid',
      room_id: roomId,
    });
    expect(result.success).toBe(false);
  });
});

describe('adminApplicationFilterSchema', () => {
  it('accepts an empty filter', () => {
    expect(adminApplicationFilterSchema.safeParse({}).success).toBe(true);
  });

  it('rejects an invalid session', () => {
    expect(adminApplicationFilterSchema.safeParse({ session: '2026-2027' }).success).toBe(false);
  });

  it('rejects an invalid status', () => {
    expect(adminApplicationFilterSchema.safeParse({ status: 'waitlisted' }).success).toBe(false);
  });
});

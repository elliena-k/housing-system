import {
  createHostelSchema,
  createRoomSchema,
  updateHostelSchema,
  updateRoomSchema,
} from '@housing/shared';
import { describe, expect, it } from 'vitest';

const hostelId = '7f1c2a3b-4d5e-4f60-8a9b-0c1d2e3f4a5b';

describe('createHostelSchema', () => {
  it('accepts a minimal hostel', () => {
    const result = createHostelSchema.safeParse({ name: 'Kuti Hall' });
    expect(result.success).toBe(true);
  });

  it('rejects a one-character name', () => {
    const result = createHostelSchema.safeParse({ name: 'K' });
    expect(result.success).toBe(false);
  });

  it('rejects a negative capacity', () => {
    const result = createHostelSchema.safeParse({ name: 'Kuti Hall', capacity: -2 });
    expect(result.success).toBe(false);
  });
});

describe('updateHostelSchema', () => {
  it('rejects an empty update', () => {
    const result = updateHostelSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('createRoomSchema', () => {
  it('accepts a valid room', () => {
    const result = createRoomSchema.safeParse({
      hostel_id: hostelId,
      room_number: 'A101',
      capacity: 4,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid hostel identifier', () => {
    const result = createRoomSchema.safeParse({
      hostel_id: 'not-a-uuid',
      room_number: 'A101',
      capacity: 4,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a zero capacity', () => {
    const result = createRoomSchema.safeParse({
      hostel_id: hostelId,
      room_number: 'A101',
      capacity: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe('updateRoomSchema', () => {
  it('rejects an empty update', () => {
    const result = updateRoomSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

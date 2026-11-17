import { describe, expect, it } from 'vitest';
import { mapAllocationError } from './service.js';

describe('mapAllocationError', () => {
  it('maps an unavailable room to 409', () => {
    const error = mapAllocationError({ message: 'ROOM_UNAVAILABLE' });
    expect(error.status).toBe(409);
    expect(error.code).toBe('ROOM_UNAVAILABLE');
  });

  it('maps a gender mismatch to 409', () => {
    const error = mapAllocationError({ message: 'GENDER_MISMATCH' });
    expect(error.status).toBe(409);
    expect(error.code).toBe('GENDER_MISMATCH');
  });

  it('maps a duplicate allocation to 409', () => {
    const error = mapAllocationError({ code: '23505', message: 'duplicate key' });
    expect(error.status).toBe(409);
    expect(error.code).toBe('ALREADY_ALLOCATED');
  });

  it('falls back to a server error', () => {
    const error = mapAllocationError({ message: 'something else' });
    expect(error.status).toBe(500);
    expect(error.code).toBe('ALLOCATION_FAILED');
  });
});

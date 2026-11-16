import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';

describe('GET /api/health', () => {
  it('returns the service status and open session', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      session: expect.any(String),
    });
  });
});

describe('unknown routes', () => {
  it('returns a structured 404 response', async () => {
    const response = await request(app).get('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});

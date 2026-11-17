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

describe('authentication guard', () => {
  it.each([
    '/api/me',
    '/api/students/me',
    '/api/applications/me',
    '/api/status/me',
    '/api/admin/hostels',
    '/api/admin/rooms',
    '/api/admin/applications',
    '/api/admin/students',
    '/api/admin/allocations',
    '/api/admin/stats',
  ])('rejects unauthenticated access to %s', async (path) => {
    const response = await request(app).get(path);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });
});

describe('registration validation', () => {
  it('returns field errors for an empty registration', async () => {
    const response = await request(app).post('/api/auth/register').send({});

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.fields).toHaveProperty('first_name');
    expect(response.body.error.fields).toHaveProperty('email');
  });
});

describe('unknown routes', () => {
  it('returns a structured 404 response', async () => {
    const response = await request(app).get('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});

describe('request parsing', () => {
  it('returns a structured error for malformed JSON', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send('{"broken":');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_JSON');
  });
});

import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '@/app';

describe('health endpoint', () => {
  it('returns 200 with ok status', async () => {
    const res = await request(app).get('/api/v1/health').expect(200);

    expect(res.body).toEqual({ data: { status: 'ok' } });
  });
});

describe('unknown routes', () => {
  it('returns 404 in standard error format', async () => {
    const res = await request(app).get('/api/v1/olmayan').expect(404);

    expect(res.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });
});

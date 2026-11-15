import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';
import type { Role } from '@/generated/prisma/enums';
import { createUser, loginAs, loginWithCookie } from '../../../tests/helpers';

type PublicUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
};

type ErrorResponse = {
  error: { code: string; message: string };
};

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/v1/auth/register', () => {
  it('creates a user and returns it without passwordHash', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'new@example.com',
      password: 'password123',
      fullName: 'New User',
    });

    expect(res.status).toBe(201);
    const body = res.body as { data: PublicUser };
    expect(body.data.email).toBe('new@example.com');
    expect(body.data).not.toHaveProperty('passwordHash');
  });

  it('assigns USER role even when ADMIN is sent', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'sneaky@example.com',
      password: 'password123',
      fullName: 'Sneaky User',
      role: 'ADMIN',
    });

    expect(res.status).toBe(201);
    const body = res.body as { data: PublicUser };
    expect(body.data.role).toBe('USER');
  });

  it('returns 409 for a duplicate email', async () => {
    await createUser({ email: 'dup@example.com' });

    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'dup@example.com',
      password: 'password123',
      fullName: 'Dup User',
    });

    expect(res.status).toBe(409);
    expect((res.body as ErrorResponse).error.code).toBe('CONFLICT');
  });

  it('returns 400 for an invalid email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'not-an-email',
      password: 'password123',
      fullName: 'Bad Email',
    });

    expect(res.status).toBe(400);
    expect((res.body as ErrorResponse).error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns accessToken, user and an httpOnly refresh cookie', async () => {
    await createUser({ email: 'login@example.com' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    const body = res.body as {
      data: { accessToken: string; user: PublicUser };
    };
    expect(body.data.accessToken).toEqual(expect.any(String));
    expect(body.data.user.email).toBe('login@example.com');
    expect(body.data.user).not.toHaveProperty('passwordHash');

    const headers = res.headers as Record<string, string | string[] | undefined>;
    const setCookie = headers['set-cookie'];
    const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    expect(cookieHeader).toEqual(expect.stringContaining('refreshToken='));
    expect(cookieHeader).toEqual(expect.stringContaining('HttpOnly'));
    expect(String(cookieHeader)).toContain('refreshToken=');
    expect(String(cookieHeader)).toContain('HttpOnly');
  });

  it('returns the same 401 message for wrong password and unknown email', async () => {
    await createUser({ email: 'real@example.com' });

    const wrongPassword = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'real@example.com', password: 'wrong-password' });

    const unknownEmail = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ghost@example.com', password: 'password123' });

    const wrongBody = wrongPassword.body as ErrorResponse;
    const unknownBody = unknownEmail.body as ErrorResponse;

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongBody.error.message).toBe(unknownBody.error.message);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns the current user for a valid token', async () => {
    const token = await loginAs('USER');

    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const body = res.body as { data: PublicUser };
    expect(body.data.email).toMatch(/@test\.dev$/);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect((res.body as ErrorResponse).error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
    expect((res.body as ErrorResponse).error.code).toBe('UNAUTHORIZED');
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('rotates the refresh token: the old one is rejected', async () => {
    const { refreshToken } = await loginWithCookie('USER');

    const first = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(first.status).toBe(200);
    const firstBody = first.body as { data: { accessToken: string } };
    expect(firstBody.data.accessToken).toEqual(expect.any(String));

    const second = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(second.status).toBe(401);
  });

  it('returns 401 without a cookie', async () => {
    const res = await request(app).post('/api/v1/auth/refresh');

    expect(res.status).toBe(401);
    expect((res.body as ErrorResponse).error.code).toBe('UNAUTHORIZED');
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('revokes the refresh token so refresh returns 401 afterwards', async () => {
    const { refreshToken } = await loginWithCookie('USER');

    const logout = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(logout.status).toBe(204);

    const refresh = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(refresh.status).toBe(401);
  });
});

describe('admin-only endpoints', () => {
  it('GET /users returns 200 for an admin', async () => {
    const token = await loginAs('ADMIN');

    const res = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('GET /users returns 403 for a regular user', async () => {
    const token = await loginAs('USER');

    const res = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect((res.body as ErrorResponse).error.code).toBe('FORBIDDEN');
  });

  it('GET /users returns 401 without a token', async () => {
    const res = await request(app).get('/api/v1/users');

    expect(res.status).toBe(401);
    expect((res.body as ErrorResponse).error.code).toBe('UNAUTHORIZED');
  });
});

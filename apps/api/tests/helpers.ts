import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import type { Role } from '@/generated/prisma/enums';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';

const TEST_PASSWORD = 'password123';

export async function createUser(
  data: {
    email?: string;
    password?: string;
    fullName?: string;
    role?: Role;
  } = {},
) {
  const passwordHash = await bcrypt.hash(data.password ?? TEST_PASSWORD, 10);
  return prisma.user.create({
    data: {
      email: data.email ?? `user-${randomUUID()}@test.dev`,
      passwordHash,
      fullName: data.fullName ?? 'Test User',
      role: data.role ?? 'USER',
    },
  });
}

export async function loginAs(role: Role = 'USER'): Promise<string> {
  const user = await createUser({ role });
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: user.email, password: TEST_PASSWORD });
  const body = res.body as { data: { accessToken: string } };
  return body.data.accessToken;
}

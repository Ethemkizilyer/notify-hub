import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/utils/app-error';
import type { LoginInput, RegisterInput } from './auth.schema';
import type { Role } from '@/generated/prisma/enums';
import type { UserModel } from '@/generated/prisma/models';
import { env } from '@/config/env';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'node:crypto';

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  createdAt: true,
} as const;

const BCRYPT_ROUNDS = 10;
const ACCESS_TOKEN_TTL = '15m';
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const DUMMY_PASSWORD_HASH = '$2b$10$JBINOF2qRVBctvT/97JZneH3gfhejf/cmBcv8qED8SWZTZAERDHxi';

export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function toPublicUser(user: UserModel) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function signAccessToken(user: UserModel): string {
  const payload: AccessTokenPayload = { sub: user.id, role: user.role };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

async function createRefreshToken(userId: string): Promise<string> {
  const token = randomBytes(48).toString('base64url');
  const tokenHash = hashToken(token);
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });
  return token;
}

export async function register(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingUser) {
    throw AppError.conflict('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
    },
    select: PUBLIC_USER_SELECT,
  });
}
export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  const hashToCompare = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const isValidPassword = await bcrypt.compare(input.password, hashToCompare);

  if (!user || !isValidPassword) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);

  return { accessToken, refreshToken, user: toPublicUser(user) };
}

export async function refresh(rawToken: string | undefined) {
  if (!rawToken) {
    throw AppError.unauthorized('Missing refresh token');
  }

  const tokenHash = hashToken(rawToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!storedToken || storedToken.revokedAt !== null || storedToken.expiresAt <= new Date()) {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  const accessToken = signAccessToken(storedToken.user);
  const refreshToken = await createRefreshToken(storedToken.userId);

  return { accessToken, refreshToken, user: toPublicUser(storedToken.user) };
}

export async function logout(rawToken: string | undefined): Promise<void> {
  if (!rawToken) return;

  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found');
  return toPublicUser(user);
}

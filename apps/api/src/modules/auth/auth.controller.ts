import type { CookieOptions, Request, Response } from 'express';
import { env } from '@/config/env';
import { AppError } from '@/utils/app-error';
import * as authService from './auth.service';
import { loginSchema, registerSchema } from './auth.schema';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/v1/auth',
  maxAge: authService.REFRESH_TOKEN_TTL_MS,
};

function getRefreshTokenCookie(req: Request): string | undefined {
  return (req.cookies as Record<string, string | undefined>)[REFRESH_TOKEN_COOKIE];
}

function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, REFRESH_TOKEN_COOKIE_OPTIONS);
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  res.status(201).json({ data: await authService.register(input) });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const { accessToken, refreshToken, user } = await authService.login(input);

  setRefreshTokenCookie(res, refreshToken);
  res.json({ data: { accessToken, user } });
}

export async function refresh(req: Request, res: Response) {
  const { accessToken, refreshToken, user } = await authService.refresh(getRefreshTokenCookie(req));

  setRefreshTokenCookie(res, refreshToken);
  res.json({ data: { accessToken, user } });
}

export async function logout(req: Request, res: Response) {
  await authService.logout(getRefreshTokenCookie(req));
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/v1/auth' });
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized('Authentication required');
  res.json({ data: await authService.getMe(req.user.id) });
}

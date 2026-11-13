import type { Request, Response } from 'express';
import * as authService from './auth.service';
import { loginSchema, registerSchema } from './auth.schema';
import { env } from '@/config/env';

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  res.status(201).json({ data: await authService.register(input) });
}
export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const { accessToken, refreshToken, user } = await authService.login(input);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: authService.REFRESH_TOKEN_TTL_MS,
  });

  res.json({ data: { accessToken, user } });
}

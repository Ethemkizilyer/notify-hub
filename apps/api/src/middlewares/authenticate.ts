import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { AccessTokenPayload } from '@/modules/auth/auth.service';
import { env } from '@/config/env';
import { AppError } from '@/utils/app-error';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing or invalid Authorization header');
  }

  const token = header.slice('Bearer '.length);

  let payload: AccessTokenPayload;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }

  if (typeof payload.sub !== 'string' || typeof payload.role !== 'string') {
    throw AppError.unauthorized('Invalid token payload');
  }

  req.user = { id: payload.sub, role: payload.role };
  next();
}

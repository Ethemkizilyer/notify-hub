import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@/generated/prisma/enums';
import { AppError } from '@/utils/app-error';

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden('Insufficient permissions');
    }

    next();
  };
}

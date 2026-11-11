import { AppError } from '@/utils/app-error';
import type { NextFunction, Request, Response } from 'express';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound('Route not found'));
}

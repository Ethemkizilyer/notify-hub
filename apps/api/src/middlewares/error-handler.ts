import { AppError } from '@/utils/app-error';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        details: err.issues,
      },
    });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details === undefined ? {} : { details: err.details }),
      },
    });
    return;
  }
  req.log.error(err, 'Unhandled error');
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    },
  });
}

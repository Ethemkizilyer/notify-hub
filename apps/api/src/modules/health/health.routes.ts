import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { AppError } from '@/utils/app-error';
import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`.catch(() => {
    throw AppError.serviceUnavailable('Database connection failed');
  });

  await redis.ping().catch(() => {
    throw AppError.serviceUnavailable('Redis connection failed');
  });

  res.status(200).json({ data: { status: 'ok' } });
});

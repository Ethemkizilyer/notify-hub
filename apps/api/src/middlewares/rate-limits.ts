import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { RedisStore, type RedisReply, type SendCommandFn } from 'rate-limit-redis';
import { redis } from '@/lib/redis';
import { env } from '@/config/env';

const sendCommand: SendCommandFn = (command, ...rest) =>
  redis.call(command, ...rest) as Promise<RedisReply>;

const isTest = env.NODE_ENV === 'test';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand,
    prefix: 'rl:auth:',
  }),
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? ''),
  skip: () => isTest,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many attempts, please try again later',
    },
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand,
    prefix: 'rl:api:',
  }),
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? ''),
  skip: () => isTest,
});

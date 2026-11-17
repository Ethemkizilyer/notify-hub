import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '@/middlewares/authenticate';
import { authRateLimiter } from '@/middlewares/rate-limits';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, authController.register);
authRouter.post('/login', authRateLimiter, authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authenticate, authController.me);

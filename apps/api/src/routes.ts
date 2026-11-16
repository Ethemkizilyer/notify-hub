import { Router } from 'express';
import { healthRouter } from './modules/health/health.routes';
import { productsRouter } from './modules/products/products.routes';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';

export const router = Router();
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/products', productsRouter);
router.use('/users', usersRouter);
router.use('/orders', ordersRouter);
router.use('/notifications', notificationsRouter);

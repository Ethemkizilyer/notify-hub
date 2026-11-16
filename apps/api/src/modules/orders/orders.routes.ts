import { Router } from 'express';
import { authenticate } from '@/middlewares/authenticate';
import * as ordersController from './orders.controller';
import { authorize } from '@/middlewares/authorize';

export const ordersRouter = Router();

ordersRouter.post('/', authenticate, ordersController.create);
ordersRouter.get('/', authenticate, ordersController.list);
ordersRouter.get('/:id', authenticate, ordersController.getById);
ordersRouter.patch('/:id/status', authenticate, authorize('ADMIN'), ordersController.updateStatus);
ordersRouter.post('/:id/cancel', authenticate, ordersController.cancel);

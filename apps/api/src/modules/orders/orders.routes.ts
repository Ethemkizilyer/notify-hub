import { Router } from 'express';
import { authenticate } from '@/middlewares/authenticate';
import * as ordersController from './orders.controller';

export const ordersRouter = Router();

ordersRouter.post('/', authenticate, ordersController.create);

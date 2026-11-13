import { Router } from 'express';
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import * as productsController from './products.controller';

export const productsRouter = Router();

productsRouter.get('/', productsController.list);
productsRouter.get('/:id', productsController.getById);
productsRouter.post('/', authenticate, authorize('ADMIN'), productsController.create);
productsRouter.patch('/:id', authenticate, authorize('ADMIN'), productsController.update);
productsRouter.delete('/:id', authenticate, authorize('ADMIN'), productsController.deactivate);

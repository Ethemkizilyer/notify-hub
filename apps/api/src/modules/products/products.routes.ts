import { Router } from 'express';
import * as productsController from './products.controller';

export const productsRouter = Router();

productsRouter.get('/', productsController.list);
productsRouter.get('/:id', productsController.getById);
productsRouter.post('/', productsController.create);
productsRouter.patch('/:id', productsController.update);
productsRouter.delete('/:id', productsController.deactivate);

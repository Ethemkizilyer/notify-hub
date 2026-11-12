import { Router } from 'express';
import { healthRouter } from './modules/health/health.routes';
import { productsRouter } from './modules/products/products.routes';

export const router = Router();
router.use('/health', healthRouter);
router.use('/products', productsRouter);

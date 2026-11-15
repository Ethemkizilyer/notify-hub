import type { Request, Response } from 'express';
import { AppError } from '@/utils/app-error';
import * as ordersService from './orders.service';
import { createOrderSchema } from './orders.schema';

export async function create(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized('Authentication required');
  const input = createOrderSchema.parse(req.body);
  const order = await ordersService.createOrder(req.user.id, input);
  res.status(201).json({ data: order });
}

import type { Request, Response } from 'express';
import { AppError } from '@/utils/app-error';
import * as ordersService from './orders.service';
import { buildPaginationMeta } from '@/utils/pagination';
import {
  createOrderSchema,
  listOrdersQuerySchema,
  orderIdParamsSchema,
  updateOrderStatusSchema,
} from './orders.schema';

export async function create(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized('Authentication required');
  const input = createOrderSchema.parse(req.body);
  const order = await ordersService.createOrder(req.user.id, input);
  res.status(201).json({ data: order });
}

export async function list(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized('Authentication required');
  const query = listOrdersQuerySchema.parse(req.query);
  const { items, total } = await ordersService.listOrders(req.user, query);
  res.json({
    data: items,
    meta: buildPaginationMeta(query.page, query.limit, total),
  });
}

export async function getById(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized('Authentication required');
  const { id } = orderIdParamsSchema.parse(req.params);
  res.json({ data: await ordersService.getOrderById(req.user, id) });
}

export async function updateStatus(req: Request, res: Response) {
  const { id } = orderIdParamsSchema.parse(req.params);
  const { status } = updateOrderStatusSchema.parse(req.body);
  res.json({ data: await ordersService.updateOrderStatus(id, status) });
}

export async function cancel(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized('Authentication required');
  const { id } = orderIdParamsSchema.parse(req.params);
  res.json({ data: await ordersService.cancelOrder(req.user, id) });
}

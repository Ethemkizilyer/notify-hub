import { OrderStatus } from '@/generated/prisma/browser';
import { z } from 'zod';
import { createOrderSchema, orderItemSchema } from '@notifyhub/shared';

export { createOrderSchema, orderItemSchema };

export const orderIdParamsSchema = z.object({
  id: z.uuid(),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(OrderStatus).optional(),
  userId: z.uuid().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(OrderStatus),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderIdParams = z.infer<typeof orderIdParamsSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

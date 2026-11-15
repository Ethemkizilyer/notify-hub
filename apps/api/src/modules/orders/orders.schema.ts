import { OrderStatus } from '@/generated/prisma/browser';
import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().min(1).max(99),
});

export const createOrderSchema = z
  .object({
    items: z.array(orderItemSchema).min(1).max(50),
  })
  .superRefine((data, ctx) => {
    const ids = data.items.map((item) => item.productId);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['items'],
        message: 'Duplicate productId in items',
      });
    }
  });
export const orderIdParamsSchema = z.object({
  id: z.uuid(),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(OrderStatus).optional(),
  userId: z.uuid().optional(),
});

export type OrderIdParams = z.infer<typeof orderIdParamsSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

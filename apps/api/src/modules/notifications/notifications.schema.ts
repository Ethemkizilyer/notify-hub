import { z } from 'zod';

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unread: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export const notificationIdParamsSchema = z.object({
  id: z.uuid(),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
export type NotificationIdParams = z.infer<typeof notificationIdParamsSchema>;

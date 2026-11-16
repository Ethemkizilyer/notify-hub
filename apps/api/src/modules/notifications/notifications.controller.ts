import type { Request, Response } from 'express';
import { AppError } from '@/utils/app-error';
import { buildPaginationMeta } from '@/utils/pagination';
import * as notificationsService from './notifications.service';
import { listNotificationsQuerySchema, notificationIdParamsSchema } from './notifications.schema';

export async function list(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized('Authentication required');
  const query = listNotificationsQuerySchema.parse(req.query);
  const { items, total } = await notificationsService.listForUser(req.user.id, query);
  res.json({
    data: items,
    meta: buildPaginationMeta(query.page, query.limit, total),
  });
}

export async function unreadCount(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized('Authentication required');
  const count = await notificationsService.getUnreadCount(req.user.id);
  res.json({ data: { count } });
}

export async function markAsRead(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized('Authentication required');
  const { id } = notificationIdParamsSchema.parse(req.params);
  res.json({ data: await notificationsService.markAsRead(req.user.id, id) });
}

export async function markAllAsRead(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized('Authentication required');
  res.json({ data: await notificationsService.markAllAsRead(req.user.id) });
}

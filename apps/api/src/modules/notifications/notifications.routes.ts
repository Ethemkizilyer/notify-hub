import { Router } from 'express';
import { authenticate } from '@/middlewares/authenticate';
import * as notificationsController from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.get('/', authenticate, notificationsController.list);
notificationsRouter.get('/unread-count', authenticate, notificationsController.unreadCount);
notificationsRouter.patch('/read-all', authenticate, notificationsController.markAllAsRead);
notificationsRouter.patch('/:id/read', authenticate, notificationsController.markAsRead);

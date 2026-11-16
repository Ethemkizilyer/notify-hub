import type { Prisma } from '@/generated/prisma/client';
import type { NotificationType } from '@/generated/prisma/enums';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/utils/app-error';
import { getSkip } from '@/utils/pagination';
import type { ListNotificationsQuery } from './notifications.schema';

type NotificationContent = {
  type: NotificationType;
  title: string;
  message: string;
  orderId?: string;
};

export async function listForUser(userId: string, query: ListNotificationsQuery) {
  const where: Prisma.NotificationWhereInput = {
    recipientId: userId,
    ...(query.unread ? { readAt: null } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: getSkip(query.page, query.limit),
      take: query.limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return { items, total };
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { recipientId: userId, readAt: null },
  });
}

export async function markAsRead(userId: string, id: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.recipientId !== userId) {
    throw AppError.notFound('Notification not found');
  }

  if (notification.readAt) return notification;

  return prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });
}

export async function markAllAsRead(userId: string) {
  const { count } = await prisma.notification.updateMany({
    where: { recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });
  return { updated: count };
}

export async function createForAdmins(data: NotificationContent) {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  });

  return prisma.notification.createMany({
    data: admins.map((admin) => ({
      recipientId: admin.id,
      type: data.type,
      title: data.title,
      message: data.message,
      orderId: data.orderId,
    })),
  });
}

export async function createForUser(userId: string, data: NotificationContent) {
  return prisma.notification.create({
    data: { recipientId: userId, ...data },
  });
}

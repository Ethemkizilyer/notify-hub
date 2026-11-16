import { Worker, type Job } from 'bullmq';
import Redis from 'ioredis';
import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import * as notificationsService from '@/modules/notifications/notifications.service';

type NotificationJobData = { orderId: string };

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: job.data.orderId },
    include: {
      user: { select: { id: true, fullName: true } },
      items: {
        include: { product: { select: { name: true } } },
      },
    },
  });

  if (!order) {
    logger.warn(
      { orderId: job.data.orderId, job: job.name },
      'Order not found, skipping notification job',
    );
    return;
  }

  if (job.name === 'order-created') {
    await notificationsService.createForAdmins({
      type: 'ORDER_CREATED',
      title: 'New order received',
      message: `Order for ${order.user.fullName} — ${order.items.length} item(s), total ${(order.totalCents / 100).toFixed(2)}`,
      orderId: order.id,
    });
    return;
  }

  if (job.name === 'order-status-changed') {
    await notificationsService.createForUser(order.userId, {
      type: 'ORDER_STATUS_CHANGED',
      title: 'Order status updated',
      message: `Your order is now ${order.status}`,
      orderId: order.id,
    });
    return;
  }

  logger.warn({ job: job.name }, 'Unknown notification job, skipping');
}

export const notificationWorker = new Worker<NotificationJobData>(
  'notifications',
  processNotificationJob,
  { connection },
);

notificationWorker.on('ready', () => {
  logger.info('Notification worker ready');
});

notificationWorker.on('failed', (job, error) => {
  logger.error({ jobId: job?.id, jobName: job?.name, err: error }, 'Notification job failed');
});

export async function closeNotificationWorker(): Promise<void> {
  await notificationWorker.close();
  connection.disconnect();
}

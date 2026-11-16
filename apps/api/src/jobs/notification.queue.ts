import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from '@/config/env';

type NotificationJobData = { orderId: string };

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const notificationQueue = new Queue<NotificationJobData>('notifications', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

export async function enqueueOrderCreated(orderId: string): Promise<void> {
  await notificationQueue.add('order-created', { orderId });
}

export async function enqueueOrderStatusChanged(orderId: string): Promise<void> {
  await notificationQueue.add('order-status-changed', { orderId });
}

export async function closeNotificationQueue(): Promise<void> {
  await notificationQueue.close();
  connection.disconnect();
}

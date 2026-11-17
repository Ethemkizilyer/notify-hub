import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { closeNotificationWorker, notificationWorker } from '@/jobs/notification.worker';

notificationWorker.on('ready', () => {
  logger.info('Notification worker process started');
});

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info({ signal }, 'Worker shutting down');

  const forceExit = setTimeout(() => {
    logger.error('Worker shutdown timed out, forcing exit');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  await closeNotificationWorker();
  await prisma.$disconnect();

  clearTimeout(forceExit);
  process.exit(0);
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

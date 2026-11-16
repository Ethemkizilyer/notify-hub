import { logger } from '@/lib/logger';
import { closeNotificationWorker, notificationWorker } from '@/jobs/notification.worker';

notificationWorker.on('ready', () => {
  logger.info('Notification worker process started');
});

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Worker shutting down');
  await closeNotificationWorker();
  process.exit(0);
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

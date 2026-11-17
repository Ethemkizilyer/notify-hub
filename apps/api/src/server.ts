import { createServer } from 'node:http';
import { env } from '@/config/env';
import { app } from '@/app';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';
import { closeNotificationQueue } from './jobs/notification.queue';
import { initSocket } from './socket';

const server = createServer(app);
const socket = initSocket(server);

server.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT}`);
});

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info({ signal }, 'Shutting down server');

  const forceExit = setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  await new Promise<void>((resolve) => {
    server.close(() => resolve());
    server.closeIdleConnections();
  });
  logger.info('HTTP server closed');

  await socket.close();

  await Promise.allSettled([prisma.$disconnect(), redis.quit(), closeNotificationQueue()]);

  clearTimeout(forceExit);
  process.exit(0);
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

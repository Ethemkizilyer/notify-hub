import { createServer } from 'node:http';
import { env } from '@/config/env';
import { app } from '@/app';
import { logger } from './lib/logger';
import { initSocket } from './socket';

const server = createServer(app);
initSocket(server);

server.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT}`);
});

import { io } from 'socket.io-client';
import { logger } from '@/lib/logger';

const token = process.argv[2];
if (!token) {
  logger.error('Usage: tsx scripts/socket-test.ts <accessToken>');
  process.exit(1);
}

const socket = io('http://localhost:3000', {
  auth: { token },
  transports: ['websocket'],
});

socket.on('connect', () => {
  logger.info({ socketId: socket.id }, 'Connected');
});

socket.on('notification:new', (payload: unknown) => {
  logger.info({ payload }, 'notification:new');
});

socket.on('connect_error', (error) => {
  logger.error({ err: error.message }, 'connect_error');
});

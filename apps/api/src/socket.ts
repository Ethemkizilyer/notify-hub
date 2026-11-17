import type { Server as HttpServer } from 'node:http';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import type { AccessTokenPayload } from '@/modules/auth/auth.service';
import { Server, type DefaultEventsMap } from 'socket.io';
import type { AppSocketData } from '@/types/socket';

export function initSocket(httpServer: HttpServer) {
  const pubClient = new Redis(env.REDIS_URL);
  const subClient = new Redis(env.REDIS_URL);

  const io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, AppSocketData>(
    httpServer,
    {
      cors: { origin: env.WEB_URL, credentials: true },
    },
  );

  io.adapter(createAdapter(pubClient, subClient));

  io.use((socket, next) => {
    const token: unknown = socket.handshake.auth.token;
    if (typeof token !== 'string') {
      next(new Error('Authentication required'));
      return;
    }

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

      if (typeof payload.sub !== 'string' || typeof payload.role !== 'string') {
        next(new Error('Invalid token payload'));
        return;
      }

      socket.data.user = { id: payload.sub, role: payload.role };
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.data.user;
    void socket.join(`user:${id}`);
    if (role === 'ADMIN') {
      void socket.join('role:ADMIN');
    }
    logger.info({ userId: id, role }, 'Socket connected');

    socket.on('disconnect', () => {
      logger.info({ userId: id }, 'Socket disconnected');
    });
  });

  return {
    io,
    async close(): Promise<void> {
      await io.close();
      pubClient.disconnect();
      subClient.disconnect();
    },
  };
}

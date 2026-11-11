import express from 'express';
import { router } from '@/routes';
import { pinoHttp } from 'pino-http';
import { logger } from './lib/logger';
import { errorHandler } from './middlewares/error-handler';
import { notFoundHandler } from './middlewares/not-found';

export const app = express();

app.use(pinoHttp({ logger }));
app.use('/api/v1', router);
app.use(notFoundHandler);
app.use(errorHandler);

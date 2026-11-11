import express from 'express';
import { router } from '@/routes';
import { pinoHttp } from 'pino-http';
import { logger } from './lib/logger';

export const app = express();

app.use(pinoHttp({ logger }));
app.use('/api/v1', router);

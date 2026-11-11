import express from 'express';
import { router } from '@/routes';

export const app = express();

app.use('/api/v1', router);

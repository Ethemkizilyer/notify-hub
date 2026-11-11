import { env } from '@/config/env';
import { app } from '@/app';
import { logger } from './lib/logger';

app.listen(env.PORT, (error) => {
  if (error) {
    throw error;
  }
  logger.info(`Server is running on port ${env.PORT}`);
});

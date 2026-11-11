import { env } from '@/config/env';
import { app } from '@/app';

app.listen(env.PORT, (error) => {
  if (error) {
    throw error;
  }

  // eslint-disable-next-line no-console -- replaced by pino logger in T1.3
  console.log(`API listening on http://localhost:${env.PORT}`);
});

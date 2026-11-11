import { app } from '@/app';

const port = 3000;

app.listen(port, (error) => {
  if (error) {
    throw error;
  }

  // eslint-disable-next-line no-console -- replaced by pino logger in T1.3
  console.log(`API listening on http://localhost:${port}`);
});

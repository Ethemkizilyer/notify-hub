import { defineConfig } from 'vitest/config';

process.loadEnvFile('.env');

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
  },
});

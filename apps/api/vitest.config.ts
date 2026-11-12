import { defineConfig } from 'vitest/config';

process.loadEnvFile('.env.test');

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    fileParallelism: false,
    globalSetup: './tests/global-setup.ts',
    setupFiles: './tests/setup.ts',
  },
});

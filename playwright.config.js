import { defineConfig } from '@playwright/test';
import chromium, { inflate } from '@sparticuz/chromium';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

// The npm-packaged headless browser also supplies its Linux runtime libraries.
const require = createRequire(import.meta.url);
const libraries = await inflate(
  resolve(dirname(require.resolve('@sparticuz/chromium')), '../bin/al2023.tar.br'),
);
process.env.LD_LIBRARY_PATH = `${libraries}/lib:${process.env.LD_LIBRARY_PATH || ''}`;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1440, height: 1100 },
    launchOptions: {
      executablePath: await chromium.executablePath(),
      args: chromium.args.filter((arg) => arg !== '--single-process'),
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});

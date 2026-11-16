import { defineConfig } from '@playwright/test';

const baseURL = `http://127.0.0.1:4173${process.env.VITE_BASE_PATH || '/'}`;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  workers: 1,
  timeout: 90_000,
  use: {
    baseURL,
    channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL || undefined,
    viewport: { width: 1440, height: 1000 },
    timezoneId: 'Asia/Kolkata',
    actionTimeout: 15_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
    url: baseURL,
    env: { VITE_FIREBASE_EMULATOR_HOST: '127.0.0.1' },
  },
});

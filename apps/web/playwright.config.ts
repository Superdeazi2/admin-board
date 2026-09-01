import { defineConfig, devices } from '@playwright/test'

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH
const externalServers = process.env.PLAYWRIGHT_EXTERNAL_SERVERS === 'true'
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    launchOptions: executablePath ? { executablePath } : undefined,
  },
  webServer: externalServers
    ? undefined
    : [
        {
          command:
            'DEMO_MODE=true COOKIE_SECURE=false PORT=3001 CORS_ORIGIN=http://127.0.0.1:5173 npm --workspace @admin-board/api run dev',
          url: 'http://127.0.0.1:3001/health',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          cwd: '../..',
        },
        {
          command:
            'VITE_PUBLIC_DEMO=true VITE_API_URL=http://127.0.0.1:3001 npm --workspace @admin-board/web run dev -- --host 127.0.0.1 --port 5173',
          url: 'http://127.0.0.1:5173',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          cwd: '../..',
        },
      ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})

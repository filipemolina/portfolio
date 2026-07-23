import { defineConfig, devices } from '@playwright/test'

// A dedicated port so a stray dev server on the usual one can't be mistaken for
// the suite's own (see HANDOFF.md).
const PORT = 3211
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  // Every worker shares one dev server, which compiles view components on
  // demand. Too many at once starves it and tests time out waiting for markup
  // that never arrives.
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',

  // The dev server compiles each view component the first time it is rendered,
  // which can easily outrun the 5s default on a cold start.
  timeout: 60_000,

  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  expect: {
    timeout: 20_000,
    toHaveScreenshot: { stylePath: './tests/e2e/screenshot.css' },
  },

  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: false },
    },
  ],

  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    // A stray Nuxt dev server on the default port holds a global dev lock that
    // would refuse this second one. (Nuxt-only; drops out with the migration.)
    env: { NUXT_IGNORE_LOCK: '1' },
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})

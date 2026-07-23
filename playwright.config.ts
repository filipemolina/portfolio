import { defineConfig, devices } from '@playwright/test'

// A dedicated port so a stray dev server on the usual one can't be mistaken for
// the suite's own (see HANDOFF.md).
const PORT = 3211
// E2E_BASE_URL points the suite at an already-running site (e.g. the deployed
// one) instead of starting a local server — useful for verifying a deploy.
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

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

  // Nothing to start when we've been pointed at an existing site.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        // E2E_TARGET=preview runs the same suite against the production build,
        // which catches anything that only breaks once bundled.
        command:
          process.env.E2E_TARGET === 'preview'
            ? `npm run preview -- --port ${PORT} --strictPort`
            : `npm run dev -- --port ${PORT} --strictPort`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})

import { expect, type Page } from '@playwright/test'

/** The command prompt input. */
export const promptSelector = 'input[aria-label="Terminal command input"]'

// The output region that every command renders into. Scoped to `div` on
// purpose: Nuxt's route announcer is a `<span aria-live="polite">`, and it must
// not be matched here (it disappears in the Vite migration, and this suite has
// to select the same element in both).
export const outputSelector = 'div[aria-live="polite"]'

export function prompt(page: Page) {
  return page.locator(promptSelector)
}

export function output(page: Page) {
  return page.locator(outputSelector)
}

/** Type a command and press Enter. */
export async function run(page: Page, command: string) {
  const el = prompt(page)
  await el.fill(command)
  await el.press('Enter')
}

/**
 * Stub `window.open` so the résumé URL can be asserted without actually opening
 * (and waiting on) the PDF. Must be called before `boot`.
 */
export async function captureWindowOpen(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __opened: string[] }
    w.__opened = []
    window.open = ((url?: string | URL) => {
      w.__opened.push(String(url ?? ''))
      return null
    }) as typeof window.open
  })
  return () => page.evaluate(() => (window as unknown as { __opened: string[] }).__opened)
}

/**
 * Wait for the terminal to be interactive. The prompt is present in the markup
 * before the app has mounted, so waiting on it alone is not enough — `onMounted`
 * work (theme restore, focus) needs a beat, as does the `terminal-fall` intro.
 */
export async function ready(page: Page) {
  await prompt(page).waitFor({ state: 'visible' })
  // The prompt is in the markup before the app has mounted, so its presence
  // proves nothing — keystrokes sent now are dropped. `onMounted` focuses it on
  // pointer-fine devices, which makes focus a genuine "listeners are attached"
  // signal (and one that survives the framework swap).
  await expect(prompt(page)).toBeFocused()
  // Let the `terminal-fall` intro finish so layout assertions are stable.
  await page.waitForTimeout(600)
}

/** Load the app and wait for it to be interactive. */
export async function boot(page: Page) {
  await page.goto('/')
  await ready(page)
}

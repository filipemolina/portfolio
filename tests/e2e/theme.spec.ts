import { expect, test } from '@playwright/test'
import { boot, output, ready, run } from './helpers'

const themes = ['catppuccin', 'amber', 'light'] as const

test('each theme applies data-theme and persists to localStorage', async ({ page }) => {
  await boot(page)

  for (const name of themes) {
    await run(page, `theme ${name}`)
    await expect(output(page).getByText(`theme set to ${name}`)).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('data-theme', name)
    expect(await page.evaluate(() => localStorage.getItem('portfolio-theme'))).toBe(name)
  }
})

test('the default theme removes data-theme entirely', async ({ page }) => {
  await boot(page)
  await run(page, 'theme amber')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'amber')

  await run(page, 'theme default')
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.*/)
  expect(await page.evaluate(() => localStorage.getItem('portfolio-theme'))).toBe('default')
})

test('a theme actually repaints the page', async ({ page }) => {
  await boot(page)
  const panel = page.locator('[data-terminal-panel]')
  const before = await panel.evaluate((el) => getComputedStyle(el).backgroundColor)

  await run(page, 'theme light')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  const after = await panel.evaluate((el) => getComputedStyle(el).backgroundColor)

  expect(after).not.toBe(before)
  // `light`'s --term-panel is 250 251 252.
  expect(after).toBe('rgb(250, 251, 252)')
})

test('the saved theme survives a reload', async ({ page }) => {
  await boot(page)
  await run(page, 'theme catppuccin')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'catppuccin')

  // `theme` with no arg reports the restored value, proving the Vue-side state
  // rehydrated too — not just the DOM attribute.
  await ready(page)
  await run(page, 'theme')
  await expect(output(page).getByText(/current: catppuccin/)).toBeVisible()
})

test('the saved theme is applied before the document finishes parsing (no flash)', async ({ page }) => {
  await boot(page)
  await run(page, 'theme amber')

  // Record *when* data-theme is first set, relative to document parsing. The
  // inline pre-paint script in <head> runs while readyState is still 'loading';
  // anything applied by app code (module scripts, onMounted) runs later. This
  // distinction is the whole point — a naive post-load attribute read cannot
  // tell the two apart.
  await page.addInitScript(() => {
    const w = window as unknown as { __themeSetAt?: string | null; __themeAtDCL?: string | null }
    w.__themeSetAt = null
    // Observe `document`, not `document.documentElement` — at init-script time
    // the <html> element does not exist yet.
    new MutationObserver((records) => {
      for (const r of records) {
        if (r.attributeName === 'data-theme' && w.__themeSetAt === null) {
          w.__themeSetAt = document.readyState
        }
      }
    }).observe(document, { attributes: true, subtree: true, attributeFilter: ['data-theme'] })

    document.addEventListener('DOMContentLoaded', () => {
      w.__themeAtDCL = document.documentElement.dataset.theme ?? null
    })
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const readyStateWhenSet = await page.evaluate(
    () => (window as unknown as { __themeSetAt?: string | null }).__themeSetAt,
  )
  expect(readyStateWhenSet).toBe('loading')

  const themeAtDCL = await page.evaluate(
    () => (window as unknown as { __themeAtDCL?: string | null }).__themeAtDCL,
  )
  expect(themeAtDCL).toBe('amber')

  // And it is still amber once the app has fully booted.
  await ready(page)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'amber')
})

test('the pre-paint theme script is served ahead of styles and app code', async ({ page }) => {
  const html = await (await page.request.get('/')).text()

  const scriptAt = html.indexOf("localStorage.getItem('portfolio-theme')")
  expect(scriptAt, 'inline theme script missing from the served HTML').toBeGreaterThan(-1)

  // Anything that could paint the default theme first must come after it. (In a
  // dev server styles may be injected by JS rather than <link>ed, so the
  // stylesheet check is conditional; the module-script check is not.)
  const styleAt = html.search(/<link[^>]+rel=["']stylesheet["']/)
  if (styleAt > -1) expect(scriptAt).toBeLessThan(styleAt)

  // The dev server injects its own HMR client module at the very top of <head>.
  // It renders nothing, so it cannot paint anything — skip it and check the
  // first script that actually loads the app.
  const appScript = [...html.matchAll(/<script[^>]+type=["']module["'][^>]*>/g)].find(
    (m) => !m[0].includes('@vite/'),
  )
  expect(appScript, 'no app module script found in the served HTML').toBeDefined()
  expect(scriptAt).toBeLessThan(appScript!.index)
})

test('a corrupt stored theme is ignored by the app state', async ({ page }) => {
  await boot(page)
  await page.evaluate(() => localStorage.setItem('portfolio-theme', 'not-a-theme'))
  await page.reload()
  await ready(page)

  await run(page, 'theme')
  await expect(output(page).getByText(/current: default/)).toBeVisible()
})

// Baselines are machine-specific (Chromium build + font rendering). They are
// committed for local regression checking only — see README before wiring this
// project into CI.
import { expect, test } from '@playwright/test'
import { boot, prompt, run } from './helpers'

const views: Array<[name: string, command: string]> = [
  ['about', 'cat about.md'],
  ['experience', 'cd experience'],
  ['skills', 'tree ./skills'],
  ['projects', 'ls ./projects'],
  ['contact', './contact --me'],
  ['help', 'help'],
  ['ls', 'ls'],
  ['theme-list', 'theme'],
  ['error', 'flurb'],
  ['neofetch', 'neofetch'],
]

/** Wait out the 420ms height transition and the intro fall animation. */
async function settle(page: import('@playwright/test').Page) {
  await page.waitForTimeout(900)
}

test('home', async ({ page }) => {
  await boot(page)
  await settle(page)
  await expect(page).toHaveScreenshot('home.png', { fullPage: true })
})

for (const [name, command] of views) {
  test(name, async ({ page }) => {
    await boot(page)
    await run(page, command)
    await settle(page)
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true })
  })
}

for (const theme of ['catppuccin', 'amber', 'light'] as const) {
  test(`theme-${theme}`, async ({ page }) => {
    await boot(page)
    await run(page, `theme ${theme}`)
    await run(page, 'help')
    await settle(page)
    await expect(page).toHaveScreenshot(`theme-${theme}.png`, { fullPage: true })
  })
}

test('vim', async ({ page }) => {
  await boot(page)
  await run(page, 'vim')
  await settle(page)
  await expect(page).toHaveScreenshot('vim.png', { fullPage: true })
})

test('ssh-xp', async ({ page }) => {
  await boot(page)
  await run(page, 'ssh xp@retro')
  await settle(page)
  await expect(page).toHaveScreenshot('ssh-xp.png', { fullPage: true })
})

test('tab-hint', async ({ page }) => {
  await boot(page)
  await prompt(page).fill('c')
  await prompt(page).press('Tab')
  await settle(page)
  await expect(page).toHaveScreenshot('tab-hint.png', { fullPage: true })
})

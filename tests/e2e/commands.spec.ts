import { expect, test } from '@playwright/test'
import { boot, captureWindowOpen, output, run } from './helpers'

test.beforeEach(async ({ page }) => {
  await boot(page)
})

test('the home block renders on load', async ({ page }) => {
  await expect(page.getByText('Filipe Molina', { exact: true })).toBeVisible()
  await expect(page.getByText('Senior Software Engineer — Frontend / Full-Stack')).toBeVisible()
})

test('whoami / home reset to the start screen', async ({ page }) => {
  await run(page, 'cat about.md')
  await expect(output(page).getByText('background')).toBeVisible()

  await run(page, 'whoami')
  // `home` is a reset: the transient output area empties, the persistent block stays.
  await expect(output(page).getByText('background')).toHaveCount(0)
  await expect(page.getByText('Filipe Molina', { exact: true })).toBeVisible()
})

test('about renders the about note', async ({ page }) => {
  await run(page, 'cat about.md')
  // The headings render as `## background` etc. — the `##` is a decorative span.
  await expect(output(page).getByText('background')).toBeVisible()
  await expect(output(page).getByText('focus')).toBeVisible()
  await expect(output(page).getByText('currently')).toBeVisible()
  await expect(output(page).getByText(/Senior software engineer with over 10 years/)).toBeVisible()
})

test('experience renders the work history timeline', async ({ page }) => {
  await run(page, 'cd experience')
  await expect(output(page).locator('ol > li')).not.toHaveCount(0)
  await expect(output(page).getByRole('heading', { level: 3 }).first()).toBeVisible()
})

test('skills renders the grouped skill list', async ({ page }) => {
  await run(page, 'tree ./skills')
  await expect(output(page).locator('.grid > div')).not.toHaveCount(0)
})

test('projects renders the project cards', async ({ page }) => {
  await run(page, 'ls ./projects')
  await expect(output(page).locator('article')).not.toHaveCount(0)
  await expect(output(page).getByRole('link', { name: /View on GitHub/ }).first()).toBeVisible()
})

test('contact renders the contact links', async ({ page }) => {
  await run(page, './contact --me')
  await expect(output(page).getByRole('link', { name: /filipemolina@live\.com/ })).toBeVisible()
  await expect(output(page).getByRole('link', { name: /linkedin\.com/ })).toBeVisible()
  await expect(output(page).getByRole('link', { name: /github\.com\/filipemolina/ })).toBeVisible()
})

test('help lists the documented commands', async ({ page }) => {
  await run(page, 'help')
  await expect(output(page).getByText('Available commands:')).toBeVisible()
  for (const hint of ['cat about.md', 'cd experience', 'tree ./skills', 'ls ./projects', 'theme <name>']) {
    await expect(output(page).getByText(hint, { exact: true })).toBeVisible()
  }
})

test('ls prints the directory listing', async ({ page }) => {
  await run(page, 'ls')
  await expect(
    output(page).getByText('about.md   experience/   skills.json   projects/   contact.sh   resume.pdf'),
  ).toBeVisible()
})

test('theme with no argument lists the themes and the current one', async ({ page }) => {
  await run(page, 'theme')
  await expect(output(page).getByText(/available themes: default\s+catppuccin\s+amber\s+light/)).toBeVisible()
  await expect(output(page).getByText(/current: default/)).toBeVisible()
  await expect(output(page).getByText(/usage: theme <name>/)).toBeVisible()
})

test('clear resets to home and shrinks the panel', async ({ page }) => {
  await run(page, 'ls ./projects')
  await expect(output(page).locator('article').first()).toBeVisible()
  // The height transition runs for 420ms — measure only once it has settled.
  await page.waitForTimeout(700)
  const tallHeight = (await output(page).boundingBox())!.height
  expect(tallHeight).toBeGreaterThan(0)

  await run(page, 'clear')
  await expect(output(page).locator('article')).toHaveCount(0)
  await page.waitForTimeout(700)
  const shortHeight = (await output(page).boundingBox())!.height
  expect(shortHeight).toBeLessThan(tallHeight)
})

test('an unknown command reports command not found', async ({ page }) => {
  await run(page, 'flurb')
  await expect(
    output(page).getByText("command not found: flurb — type 'help' to see available commands"),
  ).toBeVisible()
})

test('an unknown cd target reports no such section', async ({ page }) => {
  await run(page, 'cd nowhere')
  await expect(output(page).getByText('cd: no such section: nowhere')).toBeVisible()
})

test('an unknown theme name reports the available themes', async ({ page }) => {
  await run(page, 'theme neon')
  await expect(
    output(page).getByText('theme: no such theme: neon — available: default, catppuccin, amber, light'),
  ).toBeVisible()
})

test('resume opens the PDF in a new tab', async ({ page }) => {
  const opened = await captureWindowOpen(page)
  await boot(page)

  await run(page, 'cat resume.pdf')
  await expect(output(page).getByText('opening resume.pdf in a new tab…')).toBeVisible()
  expect(await opened()).toEqual([expect.stringMatching(/files\/Resume_2026\.pdf$/)])
})

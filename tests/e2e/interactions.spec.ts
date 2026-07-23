import { expect, test } from '@playwright/test'
import { boot, captureWindowOpen, output, prompt, run } from './helpers'

test.beforeEach(async ({ page }) => {
  await boot(page)
})

test('Tab completes a unique match in full', async ({ page }) => {
  await prompt(page).fill('who')
  await prompt(page).press('Tab')
  await expect(prompt(page)).toHaveValue('whoami')
})

test('Tab shows a hint list when several candidates match', async ({ page }) => {
  await prompt(page).fill('c')
  await prompt(page).press('Tab')
  // Ambiguous: the common prefix is already typed, so the value is unchanged…
  await expect(prompt(page)).toHaveValue('c')
  // …and the candidates are listed instead.
  const hint = page.locator('p.text-xs.text-term-fg\\/60')
  await expect(hint).toBeVisible()
  await expect(hint).toContainText('contact')
  await expect(hint).toContainText('clear')
})

test('Tab completes to the common prefix when it is longer than the input', async ({ page }) => {
  await prompt(page).fill('th')
  await prompt(page).press('Tab')
  await expect(prompt(page)).toHaveValue('theme')
  await expect(page.locator('p.text-xs.text-term-fg\\/60')).toContainText('theme catppuccin')
})

test('the up/down arrows walk the command history', async ({ page }) => {
  await run(page, 'help')
  await run(page, 'ls')

  await prompt(page).press('ArrowUp')
  await expect(prompt(page)).toHaveValue('ls')
  await prompt(page).press('ArrowUp')
  await expect(prompt(page)).toHaveValue('help')

  await prompt(page).press('ArrowDown')
  await expect(prompt(page)).toHaveValue('ls')
  await prompt(page).press('ArrowDown')
  await expect(prompt(page)).toHaveValue('')
})

test('the right arrow accepts the ghost-text suggestion', async ({ page }) => {
  await prompt(page).fill('ab')
  // The ghost overlay reads `about`: the typed part is rendered invisibly so the
  // un-typed remainder lines up under the real input.
  const ghost = page.locator('span.text-term-fg\\/30')
  await expect(ghost).toHaveText('about')

  await prompt(page).press('ArrowRight')
  await expect(prompt(page)).toHaveValue('about')
})

const sectionPills = [
  { label: 'about', command: 'cat about.md' },
  { label: 'experience', command: 'cd experience' },
  { label: 'skills', command: 'tree ./skills' },
  { label: 'projects', command: 'ls ./projects' },
  { label: 'contact', command: './contact --me' },
]

for (const { label, command } of sectionPills) {
  test(`the ${label} pill runs \`${command}\` and becomes current`, async ({ page }) => {
    const button = page.getByRole('button', { name: label, exact: true })
    await button.click()
    // The output echoes the hint form of the command, not the bare word.
    await expect(output(page).getByText(`$ ${command}`)).toBeVisible()
    await expect(button).toHaveAttribute('aria-current', 'page')
  })
}

test('the résumé pill runs `cat resume.pdf` and opens the PDF', async ({ page }) => {
  const opened = await captureWindowOpen(page)
  await boot(page)

  const button = page.getByRole('button', { name: 'résumé ↓' })
  await button.click()

  await expect(output(page).getByText('$ cat resume.pdf')).toBeVisible()
  expect(await opened()).toEqual([expect.stringMatching(/files\/Resume_2026\.pdf$/)])

  // `resume` is a download, not a view — the screen kind becomes `info`, so
  // unlike the section pills this one never reports itself as current.
  await expect(button).not.toHaveAttribute('aria-current', 'page')
})

test('only one pill is current at a time', async ({ page }) => {
  await page.getByRole('button', { name: 'about', exact: true }).click()
  await expect(page.locator('button[aria-current="page"]')).toHaveCount(1)
  await page.getByRole('button', { name: 'skills', exact: true }).click()
  await expect(page.getByRole('button', { name: 'skills', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('button[aria-current="page"]')).toHaveCount(1)
})

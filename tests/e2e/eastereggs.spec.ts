// Smoke coverage only. useEasterEggs.ts is the most stateful code in the app
// (input capture, ssh reskins, timer-driven sequences), so it can't go
// untested — but exhaustively covering every egg is not the goal here.
import { expect, test } from '@playwright/test'
import { boot, output, prompt, run } from './helpers'

test.beforeEach(async ({ page }) => {
  await boot(page)
})

test('a one-shot egg prints its output', async ({ page }) => {
  await run(page, 'pwd')
  await expect(output(page).getByText('/home/filipe/portfolio')).toBeVisible()
})

test('neofetch renders the system-info screen', async ({ page }) => {
  await run(page, 'neofetch')
  await expect(output(page).getByText('Hannah Montana Linux v26.0')).toBeVisible()
  await expect(output(page).getByText('Theme', { exact: true })).toBeVisible()
})

test('neofetch reports the active theme', async ({ page }) => {
  await run(page, 'theme amber')
  await run(page, 'neofetch')
  await expect(output(page).getByText('amber', { exact: true })).toBeVisible()
})

test('vim captures input until :q', async ({ page }) => {
  await run(page, 'vim')
  await expect(output(page).getByText('you are now trapped in vim')).toBeVisible()

  // While captured, ordinary commands are swallowed by the vim trap…
  await run(page, 'help')
  await expect(output(page).getByText('E492: Not an editor command: help')).toBeVisible()
  await expect(output(page).getByText('Available commands:')).toHaveCount(0)

  // …and so is tab-completion.
  await prompt(page).fill('who')
  await prompt(page).press('Tab')
  await expect(prompt(page)).toHaveValue('who')
  await prompt(page).fill('')

  await run(page, ':q')
  await expect(output(page).getByText(/welcome back to the shell/)).toBeVisible()

  // Back to normal: real commands run again.
  await run(page, 'help')
  await expect(output(page).getByText('Available commands:')).toBeVisible()
})

test('an ssh session reskins the prompt and exits cleanly', async ({ page }) => {
  await run(page, 'ssh xp@retro')
  await expect(output(page).getByText(/Microsoft Windows XP/)).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-os', 'xp')
  await expect(page.locator('[data-title]')).toHaveText('Telnet - retro')
  await expect(page.getByText('C:\\>', { exact: true }).first()).toBeVisible()

  await run(page, 'exit')
  await expect(output(page).getByText('Connection to retro closed.')).toBeVisible()
  await expect(page.locator('html')).not.toHaveAttribute('data-os', /.*/)
  await expect(page.locator('[data-title]')).toHaveText('filipe@portfolio: ~')
})

test('an unresolvable ssh host errors', async ({ page }) => {
  await run(page, 'ssh nowhere')
  await expect(
    output(page).getByText('ssh: Could not resolve hostname nowhere: Name or service not known'),
  ).toBeVisible()
})

test('exit outside a session runs the fake shutdown and recovers', async ({ page }) => {
  await run(page, 'exit')
  await expect(output(page).getByText('logout', { exact: true })).toBeVisible()

  // The screen "powers off" mid-sequence…
  await expect(page.locator('html')).toHaveAttribute('data-off', '1')
  // …then comes back, and the terminal is usable again.
  await expect(output(page).getByText(/you can't leave/)).toBeVisible()
  await expect(page.locator('html')).not.toHaveAttribute('data-off', /.*/)

  await run(page, 'help')
  await expect(output(page).getByText('Available commands:')).toBeVisible()
})

test('rm -rf melts down and restores', async ({ page }) => {
  await run(page, 'sudo rm -rf /')
  await expect(output(page).getByText(/Kernel panic/)).toBeVisible({ timeout: 10_000 })
  await expect(output(page).getByText(/system restored from backup/)).toBeVisible({ timeout: 10_000 })

  await run(page, 'help')
  await expect(output(page).getByText('Available commands:')).toBeVisible()
})

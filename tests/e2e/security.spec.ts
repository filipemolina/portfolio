import { expect, test } from '@playwright/test'
import { boot, output, run } from './helpers'

test.beforeEach(async ({ page }) => {
  await boot(page)
})

test('echo renders user input as escaped text, never as HTML', async ({ page }) => {
  // If anyone ever swaps the {{ screen.text }} mustache for v-html, this test fails.
  const payload = '<script>window.__pwned=true</script>'

  await run(page, `echo ${payload}`)

  // The literal text must be present in the DOM (as text, not as a script).
  await expect(output(page).getByText(payload, { exact: true })).toBeVisible()

  // And the script must NOT have executed.
  const pwned = await page.evaluate(() => (window as unknown as { __pwned?: boolean }).__pwned === true)
  expect(pwned).toBe(false)

  // Belt-and-braces: confirm there is no <script> tag inside the output area
  // beyond the app's own module script.
  const scriptCount = await output(page).locator('script').count()
  expect(scriptCount).toBe(0)
})

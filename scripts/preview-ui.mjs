/**
 * Render the settings section headlessly and capture PNGs (dev tool).
 *
 * `node scripts/preview-ui.mjs` → `docs/ui-list.png` + `docs/ui-datepicker.png`
 *
 * Why a screenshot instead of an HTML snapshot: some preview panes sandbox
 * documents and drop <style>, which made the HTML snapshot look like plain
 * text. A PNG always renders. The page is the real component with the mock API
 * from `scripts/preview-entry.jsx`, bundled by esbuild (React included, so the
 * page is self-contained) and loaded into Edge/Chrome through Playwright.
 */
import { build } from 'esbuild'
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const candidates = [
  process.env.DSH_BROWSER_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].filter((path) => typeof path === 'string' && path !== '')
const executablePath = candidates.find((path) => existsSync(path))
if (executablePath === undefined) throw new Error('preview-ui: no Edge/Chrome found; set DSH_BROWSER_PATH')

const result = await build({
  absWorkingDir: root,
  entryPoints: ['scripts/preview-entry.jsx'],
  outfile: resolve(root, 'out/preview-app.js'),
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  jsx: 'automatic',
  minify: false,
  legalComments: 'none',
  logLevel: 'warning',
})

const js = result.outputFiles.find((file) => file.path.endsWith('.js'))
const css = result.outputFiles.find((file) => file.path.endsWith('.css'))
if (js === undefined || css === undefined) throw new Error('preview-ui: esbuild produced no js/css output')

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<style>${css.text}</style>
<style>
  body { margin: 0; padding: 20px; background: #f6f6f4; font-family: system-ui, -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif; }
  #root { max-width: 900px; margin: 0 auto; }
</style>
</head><body><div id="root"></div>
<script>${js.text}</script>
</body></html>`

const browser = await chromium.launch({ executablePath, headless: true })
const page = await browser.newPage({ viewport: { width: 980, height: 900 }, deviceScaleFactor: 2 })
const failures = []
page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`))
page.on('console', (message) => {
  if (message.type() === 'error') failures.push(`console: ${message.text()}`)
})

await page.setContent(html, { waitUntil: 'load' })
await page.waitForTimeout(900)
await mkdir(resolve(root, 'docs'), { recursive: true })

// Tall viewport + subagents on: the list shot should show every row kind
// (auto / manual / subagent) and the cleanup card underneath.
await page.setViewportSize({ width: 980, height: 1520 })
await page.locator('label', { hasText: '含子代理' }).first().click()
await page.waitForTimeout(600)
await page.screenshot({ path: resolve(root, 'docs/ui-list.png'), fullPage: true })

await page.setViewportSize({ width: 980, height: 900 })
await page.waitForTimeout(200)

// Show the picker with a range already selected — an empty calendar says
// nothing about how the filter reads.
await page.locator('button', { hasText: '全部日期' }).first().click()
await page.waitForTimeout(400)
const days = page.locator('.mantine-DatePicker-day:not([data-outside="true"])')
await days.nth(2).click()
await page.waitForTimeout(200)
await days.nth(6).click()
await page.waitForTimeout(300)
// Re-open so the screenshot shows the range highlighted inside the calendar.
await page.locator('button[aria-label="日期"]').first().click()
await page.waitForTimeout(400)
await page.screenshot({ path: resolve(root, 'docs/ui-datepicker.png') })
await browser.close()

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exitCode = 1
}
console.log('preview-ui: wrote docs/ui-list.png and docs/ui-datepicker.png')

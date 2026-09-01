import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const baseURL = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:4176'
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH
const output = new URL('../docs/screenshots/', import.meta.url)

await mkdir(output, { recursive: true })

const browser = await chromium.launch(executablePath ? { executablePath } : undefined)
const context = await browser.newContext({
  viewport: { width: 1440, height: 920 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
})
const page = await context.newPage()

async function shot(name) {
  await page.screenshot({
    path: new URL(`${name}.png`, output).pathname,
    fullPage: false,
    animations: 'disabled',
  })
}

try {
  await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Войти' }).click()
  await page.waitForURL('**/tickets')
  await page.getByRole('heading', { name: 'Очередь обращений' }).waitFor()
  await shot('tickets')

  await page.goto(`${baseURL}/analytics`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Обзор' }).waitFor()
  await page.waitForTimeout(250)
  await shot('analytics')

  await page.goto(`${baseURL}/users`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Пользователи и доступ' }).waitFor()
  await page.getByRole('button', { name: /Алексей Орлов/ }).click()
  await page.getByRole('dialog', { name: 'Управление доступом' }).waitFor()
  await shot('users-permissions')
} finally {
  await browser.close()
}

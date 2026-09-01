import { test, expect } from '@playwright/test'

test('unauthenticated user is redirected to login', async ({ page }) => {
  await page.goto('/tickets')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Admin Board' })).toBeVisible()
})

test('demo admin can sign in and see the ticket queue', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page).toHaveURL(/\/tickets$/)
  await expect(page.getByRole('heading', { name: 'Очередь обращений' })).toBeVisible()
  await expect(page.getByText('Не проходит оплата')).toBeVisible()
})

test('mobile navigation opens and exposes analytics', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/login')
  await page.getByRole('button', { name: 'Войти' }).click()
  await page.getByRole('button', { name: 'Открыть меню' }).click()
  await expect(page.getByRole('link', { name: 'Статистика' })).toBeVisible()
})

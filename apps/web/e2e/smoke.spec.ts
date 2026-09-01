import { expect, test, type Page } from '@playwright/test'

const apiBaseURL = process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:3001'

async function login(page: Page) {
  await page.goto('/login')

  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url() === `${apiBaseURL}/api/auth/login` && response.request().method() === 'POST',
  )

  await page.getByRole('button', { name: 'Войти' }).click()
  const loginResponse = await loginResponsePromise

  expect(loginResponse.status(), await loginResponse.text()).toBe(200)
  await expect(page).toHaveURL(/\/tickets$/)
  await expect(page.getByRole('heading', { name: 'Очередь обращений' })).toBeVisible()
}

test('unauthenticated user is redirected to login', async ({ page }) => {
  await page.goto('/tickets')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Admin Board' })).toBeVisible()
})

test('demo login, refresh session and logout work', async ({ page, context }) => {
  await login(page)

  await context.clearCookies({ name: 'ab_access' })
  await page.goto('/analytics')
  await expect(page.getByRole('heading', { name: 'Обзор' })).toBeVisible()

  await page.getByRole('button', { name: 'Выйти' }).click()
  await expect(page).toHaveURL(/\/login$/)
})

test('ticket create, edit, status change and delete work', async ({ page }) => {
  await login(page)

  await page.getByRole('button', { name: 'Новая заявка' }).click()
  await page.getByLabel('Тема').fill('E2E portfolio ticket')
  await page.getByLabel('Клиент').fill('Test Client')
  await page.getByLabel('Категория').fill('Тест')
  await page.getByLabel('Описание').fill('Temporary browser test ticket')
  await page.getByRole('button', { name: 'Сохранить' }).click()

  await page.getByLabel('Поиск заявок').fill('E2E portfolio ticket')
  await expect(page.getByText('E2E portfolio ticket')).toBeVisible()

  const row = page.locator('.ticket-row').filter({ hasText: 'E2E portfolio ticket' })
  await row.getByRole('button', { name: 'Редактировать' }).click()
  await page.getByLabel('Тема').fill('E2E edited ticket')
  await page.getByRole('button', { name: 'Сохранить' }).click()

  await page.getByLabel('Поиск заявок').fill('E2E edited ticket')
  const editedRow = page.locator('.ticket-row').filter({ hasText: 'E2E edited ticket' })
  await expect(editedRow).toBeVisible()

  await editedRow.getByRole('button', { name: /Новая|В работе|Ожидает|Закрыта/ }).click()

  page.once('dialog', (dialog) => dialog.accept())
  await editedRow.getByRole('button', { name: 'Удалить' }).click()
  await expect(page.getByText('Заявок не найдено')).toBeVisible()
})

test('search, filters and pagination are functional', async ({ page }) => {
  await login(page)

  await expect(page.getByText('1 / 2')).toBeVisible()
  await page.getByRole('button', { name: 'Следующая страница' }).click()
  await expect(page.getByText('2 / 2')).toBeVisible()

  await page.getByLabel('Поиск заявок').fill('Acme')
  await expect(page.getByText('Не проходит оплата')).toBeVisible()
  await expect(page.getByText('Уточнить статус интеграции')).toBeVisible()

  await page.getByLabel('Фильтр по приоритету').selectOption('critical')
  await expect(page.getByText('Не проходит оплата')).toBeVisible()
})

test('users and granular permissions are visible to demo admin', async ({ page }) => {
  await login(page)
  await page.goto('/users')
  await expect(page.getByRole('heading', { name: 'Пользователи и доступ' })).toBeVisible()

  await page.getByRole('button', { name: /Алексей Орлов/ }).click()
  await expect(page.getByRole('dialog', { name: 'Управление доступом' })).toBeVisible()
  await expect(page.getByText('Дополнительные права')).toBeVisible()
  await expect(page.getByText('Аналитика')).toBeVisible()
})

test('analytics reflects seeded demo data', async ({ page }) => {
  await login(page)
  await page.goto('/analytics')
  await expect(page.getByRole('heading', { name: 'Обзор' })).toBeVisible()
  await expect(page.getByText('Всего заявок')).toBeVisible()
  await expect(page.getByText('Критические')).toBeVisible()
  await expect(page.getByText('По статусам')).toBeVisible()
})

test('demo login restores baseline after destructive changes', async ({ page }) => {
  await login(page)

  const response = await page.request.get(
    `${apiBaseURL}/api/tickets?page=1&pageSize=50&sort=updatedAt&order=desc`,
  )
  expect(response.ok()).toBeTruthy()
  const data = await response.json()
  const target = data.items[0]

  const deleted = await page.request.delete(`${apiBaseURL}/api/tickets/${target.id}`)
  expect(deleted.status()).toBe(204)

  await page.getByRole('button', { name: 'Выйти' }).click()
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page).toHaveURL(/\/tickets$/)

  const restored = await page.request.get(
    `${apiBaseURL}/api/tickets?page=1&pageSize=50&sort=updatedAt&order=desc`,
  )
  const restoredData = await restored.json()
  expect(restoredData.total).toBe(12)
})

test('mobile navigation exposes product sections', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page)
  await page.getByRole('button', { name: 'Открыть меню' }).click()
  await expect(page.getByRole('link', { name: 'Статистика' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Команда' })).toBeVisible()
})

test('ticket page renders error and empty states', async ({ page }) => {
  await login(page)

  await page.route('**/api/tickets?*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], total: 0, page: 1, pageSize: 8, pages: 1 }),
    })
  })
  await page.reload()
  await expect(page.getByText('Заявок не найдено')).toBeVisible()

  await page.unroute('**/api/tickets?*')
  await page.route('**/api/tickets?*', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Synthetic e2e failure' }),
    })
  })
  await page.reload()
  await expect(page.getByText('Synthetic e2e failure')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Повторить' })).toBeVisible()
})

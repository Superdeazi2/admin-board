# Admin Board

Панель для работы с обращениями клиентов и командой поддержки.

![Заявки](docs/screenshots/tickets.png)

## Возможности

- вход в аккаунт и роли пользователей;
- создание, редактирование и удаление заявок;
- поиск, фильтры, сортировка и пагинация;
- аналитика по заявкам;
- управление пользователями и правами доступа.

## Скриншоты

### Аналитика

![Аналитика](docs/screenshots/analytics.png)

### Пользователи и права

![Пользователи и права](docs/screenshots/users-permissions.png)

## Стек

**Frontend:** React, TypeScript, React Router, TanStack Query, React Hook Form, Zod, Recharts, Vite.

**Backend:** Node.js, Fastify, TypeScript, Prisma, PostgreSQL.

**Дополнительно:** Swagger / OpenAPI, Vitest, Playwright, ESLint, Prettier, Docker Compose.

## Локальный запуск

Нужны Node.js 22+ и Docker.

```bash
npm install
cp .env.example .env
npm run setup
npm run dev
```

После запуска:

- сайт: `http://localhost:5173`
- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/docs`

## Тестовые аккаунты

Администратор:

```text
admin@mail.ru
Admin123!
```

Менеджер:

```text
manager@mail.ru
Admin123!
```

Для публичной демо-версии используются отдельные данные.

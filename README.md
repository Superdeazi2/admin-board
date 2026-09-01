# Admin Board

Full-stack панель для работы с обращениями клиентов и командой поддержки.

Проект состоит из React-приложения и REST API. Данные хранятся в PostgreSQL. Есть авторизация, роли, дополнительные права пользователей, CRUD заявок, фильтры, аналитика и базовое тестирование.

## Возможности

- регистрация и вход в аккаунт;
- роли `admin`, `manager`, `user`;
- дополнительные права для отдельных пользователей;
- создание, редактирование и удаление заявок;
- поиск, фильтрация, сортировка и пагинация;
- назначение исполнителя;
- управление пользователями;
- удаление аккаунтов администратором;
- аналитика по статусам и приоритетам;
- Swagger/OpenAPI для REST API;
- unit-тесты для API и интерфейса;
- Playwright e2e-тесты;
- Docker Compose для PostgreSQL;
- GitHub Actions для основных проверок.

## Стек

### Frontend

- React
- TypeScript
- React Router
- TanStack Query
- React Hook Form
- Zod
- Recharts
- Vite
- Lucide React

### Backend

- Node.js
- Fastify
- TypeScript
- PostgreSQL
- Prisma
- JWT
- httpOnly cookies
- Swagger / OpenAPI

### Инструменты

- Vitest
- React Testing Library
- Playwright
- ESLint
- Prettier
- Docker Compose
- GitHub Actions

## Локальный запуск

Нужны Node.js 22+ и Docker.

```bash
npm install
cp .env.example .env
npm run setup
npm run dev
```

После запуска:

- frontend: `http://localhost:5173`
- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/docs`

Если порт `3001` нужен именно для frontend:

```bash
npm run dev:3001
```

В этом режиме:

- frontend: `http://localhost:3001`
- API: `http://localhost:3002`

## Локальные аккаунты после seed

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

Эти данные предназначены только для локального запуска. Для реального окружения секреты и пароли должны задаваться отдельно.

## Основные команды

```bash
npm run dev
npm run dev:3001
npm run setup
npm run build
npm run lint
npm run test
npm run test:e2e
npm run format
npm run format:check
npm run check
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Структура

```text
apps/
  api/        Fastify API, Prisma, PostgreSQL
  web/        React application
scripts/      локальные служебные скрипты
.github/      CI
docker-compose.yml
```

## Доступы

Роль задаёт базовые возможности пользователя. Администратор также может выдать отдельные разрешения:

- создание заявок;
- редактирование заявок;
- удаление заявок;
- просмотр аналитики;
- просмотр команды.

Проверка прав выполняется на backend, поэтому ограничения не зависят только от интерфейса.

## API

Документация доступна после запуска API:

```text
http://localhost:3001/docs
```

Для режима `dev:3001` Swagger работает на:

```text
http://localhost:3002/docs
```

import crypto from 'node:crypto'
import { Role, TicketPriority, TicketStatus } from '@prisma/client'
import { hashPassword } from './auth.js'
import { env } from './env.js'
import { prisma } from './prisma.js'

export const DEMO_EMAIL = 'demo@adminboard.app'
export const DEMO_PASSWORD = 'PortfolioDemo!2026'

export async function resetDemoWorkspace() {
  if (!env.DEMO_MODE) {
    throw new Error('Demo workspace reset is disabled outside DEMO_MODE')
  }

  const demoPasswordHash = await hashPassword(DEMO_PASSWORD)
  const disabledPasswordHash = await hashPassword(crypto.randomBytes(32).toString('hex'))

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      'TRUNCATE TABLE "RefreshToken", "Ticket", "User" RESTART IDENTITY CASCADE',
    )

    const admin = await tx.user.create({
      data: {
        name: 'Demo Admin',
        email: DEMO_EMAIL,
        passwordHash: demoPasswordHash,
        role: Role.admin,
        permissions: [],
      },
    })

    const manager = await tx.user.create({
      data: {
        name: 'Анна Морозова',
        email: 'anna@adminboard.app',
        passwordHash: disabledPasswordHash,
        role: Role.manager,
        permissions: [],
      },
    })

    const analyst = await tx.user.create({
      data: {
        name: 'Алексей Орлов',
        email: 'alexey@adminboard.app',
        passwordHash: disabledPasswordHash,
        role: Role.user,
        permissions: ['analytics.view'],
      },
    })

    await tx.user.create({
      data: {
        name: 'Мария Соколова',
        email: 'maria@adminboard.app',
        passwordHash: disabledPasswordHash,
        role: Role.user,
        permissions: [],
      },
    })

    await tx.ticket.createMany({
      data: [
        {
          title: 'Не проходит оплата',
          description: 'Ошибка при оплате годового тарифа банковской картой.',
          client: 'Acme Studio',
          status: TicketStatus.new,
          priority: TicketPriority.critical,
          category: 'Оплата',
          assigneeId: admin.id,
        },
        {
          title: 'Ошибка входа после сброса пароля',
          description: 'Пользователь не может войти после обновления пароля.',
          client: 'Northwind CRM',
          status: TicketStatus.work,
          priority: TicketPriority.high,
          category: 'Доступ',
          assigneeId: manager.id,
        },
        {
          title: 'Изменить email администратора',
          description: 'Нужно обновить контактный email владельца рабочей области.',
          client: 'Pixel Forge',
          status: TicketStatus.waiting,
          priority: TicketPriority.medium,
          category: 'Аккаунт',
          assigneeId: manager.id,
        },
        {
          title: 'Не загружается договор',
          description: 'PDF зависает на этапе обработки.',
          client: 'Finex Group',
          status: TicketStatus.work,
          priority: TicketPriority.high,
          category: 'Файлы',
          assigneeId: admin.id,
        },
        {
          title: 'Вопрос по лимитам тарифа',
          description: 'Клиент уточняет доступные интеграции и лимиты API.',
          client: 'Orbit Apps',
          status: TicketStatus.new,
          priority: TicketPriority.low,
          category: 'Тарифы',
          assigneeId: analyst.id,
        },
        {
          title: 'Push-уведомления не приходят',
          description: 'После изменения настроек перестали приходить уведомления.',
          client: 'Market Desk',
          status: TicketStatus.closed,
          priority: TicketPriority.medium,
          category: 'Уведомления',
          assigneeId: admin.id,
        },
        {
          title: 'Экспорт отчёта в CSV',
          description: 'Экспорт формируется, но файл остаётся пустым.',
          client: 'Nova Retail',
          status: TicketStatus.work,
          priority: TicketPriority.medium,
          category: 'Отчёты',
          assigneeId: manager.id,
        },
        {
          title: 'Добавить второго владельца',
          description: 'Нужно предоставить владельцу филиала административный доступ.',
          client: 'Evergreen Labs',
          status: TicketStatus.waiting,
          priority: TicketPriority.high,
          category: 'Доступ',
          assigneeId: admin.id,
        },
        {
          title: 'Некорректная сумма в счёте',
          description: 'В счёте за август отображается лишняя позиция.',
          client: 'Helio Systems',
          status: TicketStatus.new,
          priority: TicketPriority.critical,
          category: 'Оплата',
          assigneeId: manager.id,
        },
        {
          title: 'Не отображается история изменений',
          description: 'Панель аудита не показывает события за вчера.',
          client: 'Bluebird Ops',
          status: TicketStatus.closed,
          priority: TicketPriority.low,
          category: 'Интерфейс',
          assigneeId: analyst.id,
        },
        {
          title: 'Медленно открывается список заявок',
          description: 'Клиент замечает задержку при первом открытии очереди.',
          client: 'Vertex Media',
          status: TicketStatus.work,
          priority: TicketPriority.medium,
          category: 'Производительность',
          assigneeId: manager.id,
        },
        {
          title: 'Уточнить статус интеграции',
          description: 'Нужен актуальный статус подключения внешнего CRM.',
          client: 'Acme Studio',
          status: TicketStatus.new,
          priority: TicketPriority.low,
          category: 'Интеграции',
          assigneeId: admin.id,
        },
      ],
    })
  })
}

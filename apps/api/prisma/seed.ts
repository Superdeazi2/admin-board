import { PrismaClient, Role, TicketPriority, TicketStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(currentDir, '../../../.env') })

const prisma = new PrismaClient()

async function moveLegacyEmail(from: string, to: string) {
  const [legacy, current] = await Promise.all([
    prisma.user.findUnique({ where: { email: from } }),
    prisma.user.findUnique({ where: { email: to } }),
  ])

  if (legacy && !current) {
    await prisma.user.update({
      where: { id: legacy.id },
      data: { email: to },
    })
  }
}

async function main() {
  await moveLegacyEmail('admin@mail.ru', 'admin@mail.ru')
  await moveLegacyEmail('manager@mail.ru', 'manager@mail.ru')

  const passwordHash = await bcrypt.hash('Admin123!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mail.ru' },
    update: {
      name: 'Михаил Русских',
      passwordHash,
      role: Role.admin,
    },
    create: {
      name: 'Михаил Русских',
      email: 'admin@mail.ru',
      passwordHash,
      role: Role.admin,
      permissions: [],
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@mail.ru' },
    update: {
      name: 'Анна Морозова',
      passwordHash,
      role: Role.manager,
    },
    create: {
      name: 'Анна Морозова',
      email: 'manager@mail.ru',
      passwordHash,
      role: Role.manager,
      permissions: [],
    },
  })

  if ((await prisma.ticket.count()) === 0) {
    await prisma.ticket.createMany({
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
          title: 'Ошибка входа',
          description: 'После сброса пароля пользователь не может войти в кабинет.',
          client: 'Northwind CRM',
          status: TicketStatus.work,
          priority: TicketPriority.high,
          category: 'Доступ',
          assigneeId: manager.id,
        },
        {
          title: 'Изменить email',
          description: 'Обновить контактный email администратора аккаунта.',
          client: 'Pixel Forge',
          status: TicketStatus.waiting,
          priority: TicketPriority.medium,
          category: 'Аккаунт',
          assigneeId: manager.id,
        },
        {
          title: 'Не загружается файл',
          description: 'Документ зависает на этапе обработки.',
          client: 'Finex Group',
          status: TicketStatus.work,
          priority: TicketPriority.high,
          category: 'Файлы',
          assigneeId: admin.id,
        },
        {
          title: 'Вопрос по тарифам',
          description: 'Клиент уточняет лимиты и доступные интеграции.',
          client: 'Orbit Apps',
          status: TicketStatus.new,
          priority: TicketPriority.low,
          category: 'Тарифы',
          assigneeId: manager.id,
        },
        {
          title: 'Уведомления не приходят',
          description: 'Push-уведомления не приходят после обновления настроек.',
          client: 'Market Desk',
          status: TicketStatus.closed,
          priority: TicketPriority.medium,
          category: 'Уведомления',
          assigneeId: admin.id,
        },
      ],
    })
  }

  console.log('Seed complete')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())

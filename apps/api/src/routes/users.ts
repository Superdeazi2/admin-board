import { Prisma, Role } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { hasPermission, permissionValues } from '../permissions.js'
import { hashPassword } from '../auth.js'
import { prisma } from '../prisma.js'

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.nativeEnum(Role),
})

const accessSchema = z
  .object({
    role: z.nativeEnum(Role).optional(),
    permissions: z.array(z.enum(permissionValues)).max(permissionValues.length).optional(),
  })
  .refine((value) => value.role !== undefined || value.permissions !== undefined, {
    message: 'Нет изменений',
  })

const paramsSchema = z.object({
  id: z.string().min(1),
})

function publicUser(user: {
  id: string
  name: string
  email: string
  role: Role
  permissions: string[]
  createdAt: Date
  _count?: { assignedTickets: number }
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    createdAt: user.createdAt,
    _count: user._count ?? { assignedTickets: 0 },
  }
}

export async function userRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: app.authenticate,
      schema: { tags: ['Users'], summary: 'List users' },
    },
    async (request, reply) => {
      if (!(await hasPermission(request.user, 'users.view'))) {
        return reply.code(403).send({ message: 'Недостаточно прав' })
      }

      const users = await prisma.user.findMany({
        orderBy: [{ role: 'asc' }, { name: 'asc' }],
        include: {
          _count: {
            select: { assignedTickets: true },
          },
        },
      })

      return users.map(publicUser)
    },
  )

  app.post(
    '/',
    {
      preHandler: app.authenticate,
      schema: { tags: ['Users'], summary: 'Create user' },
    },
    async (request, reply) => {
      if (request.user.role !== 'admin') {
        return reply
          .code(403)
          .send({ message: 'Только администратор может создавать пользователей' })
      }

      const parsed = createUserSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.code(400).send({ message: 'Проверьте данные пользователя' })
      }

      try {
        const user = await prisma.user.create({
          data: {
            name: parsed.data.name,
            email: parsed.data.email.toLowerCase(),
            passwordHash: await hashPassword(parsed.data.password),
            role: parsed.data.role,
            permissions: [],
          },
          include: {
            _count: {
              select: { assignedTickets: true },
            },
          },
        })

        return reply.code(201).send(publicUser(user))
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          return reply.code(409).send({ message: 'Пользователь с таким email уже существует' })
        }

        throw error
      }
    },
  )

  app.patch(
    '/:id/access',
    {
      preHandler: app.authenticate,
      schema: { tags: ['Users'], summary: 'Update user access' },
    },
    async (request, reply) => {
      if (request.user.role !== 'admin') {
        return reply.code(403).send({ message: 'Только администратор может менять права' })
      }

      const params = paramsSchema.safeParse(request.params)
      const body = accessSchema.safeParse(request.body)

      if (!params.success || !body.success) {
        return reply.code(400).send({ message: 'Некорректные параметры доступа' })
      }

      if (params.data.id === request.user.id && body.data.role && body.data.role !== 'admin') {
        return reply.code(400).send({
          message: 'Нельзя снять роль администратора с собственного аккаунта',
        })
      }

      try {
        const user = await prisma.user.update({
          where: { id: params.data.id },
          data: {
            ...(body.data.role ? { role: body.data.role } : {}),
            ...(body.data.permissions ? { permissions: [...new Set(body.data.permissions)] } : {}),
          },
          include: {
            _count: {
              select: { assignedTickets: true },
            },
          },
        })

        return publicUser(user)
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          return reply.code(404).send({ message: 'Пользователь не найден' })
        }

        throw error
      }
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: app.authenticate,
      schema: { tags: ['Users'], summary: 'Delete user' },
    },
    async (request, reply) => {
      if (request.user.role !== 'admin') {
        return reply.code(403).send({ message: 'Только администратор может удалять пользователей' })
      }

      const params = paramsSchema.safeParse(request.params)
      if (!params.success) {
        return reply.code(400).send({ message: 'Некорректный пользователь' })
      }

      if (params.data.id === request.user.id) {
        return reply.code(400).send({ message: 'Нельзя удалить собственный аккаунт' })
      }

      try {
        await prisma.$transaction([
          prisma.ticket.updateMany({
            where: { assigneeId: params.data.id },
            data: { assigneeId: null },
          }),
          prisma.refreshToken.deleteMany({
            where: { userId: params.data.id },
          }),
          prisma.user.delete({
            where: { id: params.data.id },
          }),
        ])

        return reply.code(204).send()
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          return reply.code(404).send({ message: 'Пользователь не найден' })
        }

        throw error
      }
    },
  )
}

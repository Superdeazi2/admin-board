import { Prisma, TicketPriority, TicketStatus } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { hasPermission } from '../permissions.js'
import { prisma } from '../prisma.js'

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(8),
  search: z.string().trim().optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  sort: z
    .enum(['updatedAt', 'createdAt', 'title', 'number', 'status', 'priority'])
    .default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

const ticketSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(4000).default(''),
  client: z.string().trim().min(2).max(180),
  status: z.nativeEnum(TicketStatus),
  priority: z.nativeEnum(TicketPriority),
  category: z.string().trim().min(2).max(100),
  assigneeId: z.string().nullable().optional(),
})

const updateSchema = ticketSchema.partial()
const paramsSchema = z.object({ id: z.string().min(1) })

export async function ticketRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: app.authenticate,
      schema: { tags: ['Tickets'], summary: 'List tickets' },
    },
    async (request, reply) => {
      const parsed = listSchema.safeParse(request.query)
      if (!parsed.success) {
        return reply.code(400).send({ message: 'Некорректные параметры фильтра' })
      }

      const { page, pageSize, search, status, priority, sort, order } = parsed.data

      const where: Prisma.TicketWhereInput = {
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { client: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      }

      const orderBy: Prisma.TicketOrderByWithRelationInput = {
        [sort]: order,
      }

      const [items, total] = await prisma.$transaction([
        prisma.ticket.findMany({
          where,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            assignee: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        prisma.ticket.count({ where }),
      ])

      return {
        items,
        total,
        page,
        pageSize,
        pages: Math.max(1, Math.ceil(total / pageSize)),
      }
    },
  )

  app.post(
    '/',
    {
      preHandler: app.authenticate,
      schema: { tags: ['Tickets'], summary: 'Create ticket' },
    },
    async (request, reply) => {
      if (!(await hasPermission(request.user, 'tickets.create'))) {
        return reply.code(403).send({ message: 'Нет права создавать заявки' })
      }

      const parsed = ticketSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.code(400).send({ message: 'Проверьте данные заявки' })
      }

      const ticket = await prisma.ticket.create({
        data: parsed.data,
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      return reply.code(201).send(ticket)
    },
  )

  app.patch(
    '/:id',
    {
      preHandler: app.authenticate,
      schema: { tags: ['Tickets'], summary: 'Update ticket' },
    },
    async (request, reply) => {
      if (!(await hasPermission(request.user, 'tickets.edit'))) {
        return reply.code(403).send({ message: 'Нет права редактировать заявки' })
      }

      const params = paramsSchema.safeParse(request.params)
      const body = updateSchema.safeParse(request.body)

      if (!params.success || !body.success) {
        return reply.code(400).send({ message: 'Проверьте изменения заявки' })
      }

      try {
        return await prisma.ticket.update({
          where: { id: params.data.id },
          data: body.data,
          include: {
            assignee: {
              select: { id: true, name: true, email: true },
            },
          },
        })
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          return reply.code(404).send({ message: 'Заявка не найдена' })
        }
        throw error
      }
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: app.authenticate,
      schema: { tags: ['Tickets'], summary: 'Delete ticket' },
    },
    async (request, reply) => {
      if (!(await hasPermission(request.user, 'tickets.delete'))) {
        return reply.code(403).send({ message: 'Нет права удалять заявки' })
      }

      const params = paramsSchema.safeParse(request.params)
      if (!params.success) {
        return reply.code(400).send({ message: 'Некорректная заявка' })
      }

      try {
        await prisma.ticket.delete({ where: { id: params.data.id } })
        return reply.code(204).send()
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          return reply.code(404).send({ message: 'Заявка не найдена' })
        }
        throw error
      }
    },
  )
}

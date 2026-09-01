import type { FastifyInstance } from 'fastify'
import { hasPermission } from '../permissions.js'
import { prisma } from '../prisma.js'

export async function statsRoutes(app: FastifyInstance) {
  app.get(
    '/overview',
    {
      preHandler: app.authenticate,
      schema: { tags: ['Stats'], summary: 'Dashboard overview' },
    },
    async (request, reply) => {
      if (!(await hasPermission(request.user, 'analytics.view'))) {
        return reply.code(403).send({ message: 'Нет доступа к аналитике' })
      }

      const [total, closed, byStatus, byPriority] = await Promise.all([
        prisma.ticket.count(),
        prisma.ticket.count({ where: { status: 'closed' } }),
        prisma.ticket.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        prisma.ticket.groupBy({
          by: ['priority'],
          _count: { _all: true },
        }),
      ])

      return {
        total,
        closedRate: total ? Math.round((closed / total) * 100) : 0,
        byStatus: byStatus.map((item) => ({
          name: item.status,
          value: item._count._all,
        })),
        byPriority: byPriority.map((item) => ({
          name: item.priority,
          value: item._count._all,
        })),
      }
    },
  )
}

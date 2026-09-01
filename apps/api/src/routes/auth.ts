import { Prisma } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  clearSession,
  hashPassword,
  hashRefreshToken,
  issueSession,
  userPayload,
  verifyPassword,
} from '../auth.js'
import { DEMO_EMAIL, DEMO_PASSWORD, resetDemoWorkspace } from '../demo.js'
import { env } from '../env.js'
import { prisma } from '../prisma.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/register',
    {
      schema: { tags: ['Auth'], summary: 'Create account' },
    },
    async (request, reply) => {
      if (env.DEMO_MODE) {
        return reply.code(403).send({ message: 'Регистрация отключена в публичном демо' })
      }

      const parsed = registerSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.code(400).send({ message: 'Проверьте данные регистрации' })
      }

      try {
        const user = await prisma.user.create({
          data: {
            name: parsed.data.name,
            email: parsed.data.email.toLowerCase(),
            passwordHash: await hashPassword(parsed.data.password),
            role: 'user',
          },
        })

        const payload = userPayload(user)
        await issueSession(app, reply, payload)
        return reply.code(201).send({ user: payload })
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          return reply.code(409).send({ message: 'Аккаунт с таким email уже существует' })
        }

        throw error
      }
    },
  )

  app.post(
    '/login',
    {
      schema: { tags: ['Auth'], summary: 'Sign in' },
    },
    async (request, reply) => {
      const parsed = loginSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.code(400).send({ message: 'Проверьте email и пароль' })
      }

      const email = parsed.data.email.toLowerCase()

      if (env.DEMO_MODE) {
        if (email !== DEMO_EMAIL || parsed.data.password !== DEMO_PASSWORD) {
          return reply.code(401).send({ message: 'Используйте demo-аккаунт из README' })
        }

        await resetDemoWorkspace()
      }

      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
        return reply.code(401).send({ message: 'Неверный email или пароль' })
      }

      const payload = userPayload(user)
      await issueSession(app, reply, payload)
      return { user: payload }
    },
  )

  app.post('/refresh', { schema: { tags: ['Auth'] } }, async (request, reply) => {
    const token = request.cookies.ab_refresh
    if (!token) {
      return reply.code(401).send({ message: 'Сессия истекла' })
    }

    const record = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashRefreshToken(token) },
      include: { user: true },
    })

    if (!record || record.expiresAt < new Date()) {
      return reply.code(401).send({ message: 'Сессия истекла' })
    }

    await prisma.refreshToken.delete({ where: { id: record.id } })

    const payload = userPayload(record.user)
    await issueSession(app, reply, payload)
    return { user: payload }
  })

  app.get(
    '/me',
    {
      preHandler: app.authenticate,
      schema: { tags: ['Auth'] },
    },
    async (request) => {
      return { user: request.user }
    },
  )

  app.post('/logout', { schema: { tags: ['Auth'] } }, async (request, reply) => {
    const token = request.cookies.ab_refresh

    if (token) {
      await prisma.refreshToken.deleteMany({
        where: { tokenHash: hashRefreshToken(token) },
      })
    }

    clearSession(reply)
    return { ok: true }
  })
}

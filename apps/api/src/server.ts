import 'dotenv/config'
import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { env } from './env.js'
import { registerAuth } from './auth.js'
import { authRoutes } from './routes/auth.js'
import { ticketRoutes } from './routes/tickets.js'
import { userRoutes } from './routes/users.js'
import { statsRoutes } from './routes/stats.js'

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
await app.register(cookie)
await app.register(jwt, { secret: env.JWT_ACCESS_SECRET })
await app.register(swagger, {
  openapi: {
    info: {
      title: 'Admin Board API',
      version: '1.0.0',
      description: 'REST API for the Admin Board support workspace',
    },
  },
})
await app.register(swaggerUi, { routePrefix: '/docs' })

await registerAuth(app)

app.get('/health', { schema: { tags: ['System'] } }, async () => ({ ok: true }))
await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(ticketRoutes, { prefix: '/api/tickets' })
await app.register(userRoutes, { prefix: '/api/users' })
await app.register(statsRoutes, { prefix: '/api/stats' })

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error)

  if (!reply.sent) {
    reply.code(500).send({ message: 'Внутренняя ошибка сервера' })
  }
})

await app.listen({ port: env.PORT, host: '0.0.0.0' })

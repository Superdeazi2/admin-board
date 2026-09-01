import crypto from 'node:crypto'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma.js'
import { env } from './env.js'
import { permissionValues, type Permission } from './permissions.js'

export type SessionUser = {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'user'
  permissions: Permission[]
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: SessionUser
    user: SessionUser
  }
}

const accessCookie = 'ab_access'
const refreshCookie = 'ab_refresh'

function normalizePermissions(values: string[]): Permission[] {
  return values.filter((value): value is Permission =>
    permissionValues.includes(value as Permission),
  )
}

function secureCookie() {
  return env.COOKIE_SECURE
}

export async function registerAuth(app: FastifyInstance) {
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies[accessCookie]
    if (!token) {
      return reply.code(401).send({ message: 'Требуется авторизация' })
    }

    let decoded: SessionUser
    try {
      decoded = app.jwt.verify(token) as SessionUser
    } catch {
      return reply.code(401).send({ message: 'Требуется авторизация' })
    }

    const current = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
      },
    })

    if (!current) {
      return reply.code(401).send({ message: 'Требуется авторизация' })
    }

    request.user = userPayload(current)
  })

  app.decorate('requireRole', (roles: SessionUser['role'][]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      await app.authenticate(request, reply)
      if (reply.sent) return
      if (!roles.includes(request.user.role)) {
        return reply.code(403).send({ message: 'Недостаточно прав' })
      }
    }
  })
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<unknown>
    requireRole: (
      roles: SessionUser['role'][],
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<unknown>
  }
}

export function userPayload(user: {
  id: string
  name: string
  email: string
  role: SessionUser['role']
  permissions: string[]
}): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: normalizePermissions(user.permissions),
  }
}

export async function issueSession(app: FastifyInstance, reply: FastifyReply, user: SessionUser) {
  const accessToken = await app.jwt.sign(user, { expiresIn: '15m' })
  const refreshId = crypto.randomBytes(32).toString('hex')
  const refreshHash = crypto.createHash('sha256').update(refreshId).digest('hex')

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  reply
    .setCookie(accessCookie, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: secureCookie(),
      path: '/',
      maxAge: 15 * 60,
    })
    .setCookie(refreshCookie, refreshId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: secureCookie(),
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60,
    })
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export function hashRefreshToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function clearSession(reply: FastifyReply) {
  reply
    .clearCookie(accessCookie, {
      path: '/',
      sameSite: 'lax',
      secure: secureCookie(),
    })
    .clearCookie(refreshCookie, {
      path: '/api/auth',
      sameSite: 'lax',
      secure: secureCookie(),
    })
}

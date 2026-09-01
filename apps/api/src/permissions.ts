import type { Role } from '@prisma/client'
import { prisma } from './prisma.js'

export const permissionValues = [
  'tickets.create',
  'tickets.edit',
  'tickets.delete',
  'analytics.view',
  'users.view',
] as const

export type Permission = (typeof permissionValues)[number]

const rolePermissions: Record<Role, readonly Permission[]> = {
  admin: permissionValues,
  manager: ['tickets.create', 'tickets.edit', 'analytics.view', 'users.view'],
  user: [],
}

export function roleHasPermission(role: Role, permission: Permission) {
  return rolePermissions[role].includes(permission)
}

export async function hasPermission(user: { id: string; role: Role }, permission: Permission) {
  if (roleHasPermission(user.role, permission)) {
    return true
  }

  const stored = await prisma.user.findUnique({
    where: { id: user.id },
    select: { permissions: true },
  })

  return stored?.permissions.includes(permission) ?? false
}

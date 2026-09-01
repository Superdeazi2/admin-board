import type { Role } from '@prisma/client'

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

export function hasPermission(
  user: { role: Role; permissions?: readonly string[] },
  permission: Permission,
) {
  return roleHasPermission(user.role, permission) || user.permissions?.includes(permission) === true
}

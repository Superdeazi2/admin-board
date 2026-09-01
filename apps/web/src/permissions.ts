import type { Permission, Role, SessionUser } from './api'

const rolePermissions: Record<Role, readonly Permission[]> = {
  admin: ['tickets.create', 'tickets.edit', 'tickets.delete', 'analytics.view', 'users.view'],
  manager: ['tickets.create', 'tickets.edit', 'analytics.view', 'users.view'],
  user: [],
}

export function hasUiPermission(user: SessionUser | null | undefined, permission: Permission) {
  if (!user) return false
  return rolePermissions[user.role].includes(permission) || user.permissions.includes(permission)
}

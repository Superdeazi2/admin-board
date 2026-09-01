import { describe, expect, it } from 'vitest'
import { hasPermission, permissionValues, roleHasPermission } from './permissions.js'

describe('role permission matrix', () => {
  it('gives administrators every declared permission', () => {
    for (const permission of permissionValues) {
      expect(roleHasPermission('admin', permission)).toBe(true)
    }
  })

  it('keeps destructive ticket deletion out of the manager role', () => {
    expect(roleHasPermission('manager', 'tickets.create')).toBe(true)
    expect(roleHasPermission('manager', 'tickets.edit')).toBe(true)
    expect(roleHasPermission('manager', 'analytics.view')).toBe(true)
    expect(roleHasPermission('manager', 'users.view')).toBe(true)
    expect(roleHasPermission('manager', 'tickets.delete')).toBe(false)
  })

  it('starts regular users without role-level elevated permissions', () => {
    for (const permission of permissionValues) {
      expect(roleHasPermission('user', permission)).toBe(false)
    }
  })

  it('adds explicit user permissions without changing the base role', () => {
    const user = { role: 'user' as const, permissions: ['analytics.view'] }
    expect(hasPermission(user, 'analytics.view')).toBe(true)
    expect(hasPermission(user, 'tickets.delete')).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './auth.js'

describe('password helpers', () => {
  it('hashes and verifies passwords', async () => {
    const hash = await hashPassword('Admin123!')
    expect(hash).not.toBe('Admin123!')
    await expect(verifyPassword('Admin123!', hash)).resolves.toBe(true)
    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false)
  })
})

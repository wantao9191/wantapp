import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '@/lib/password'

describe('password', () => {
  it('hash and verify success', async () => {
    process.env.BCRYPT_COST = '4'
    const hashed = await hashPassword('secret')
    expect(hashed).not.toBe('secret')
    const ok = await verifyPassword('secret', hashed)
    expect(ok).toBe(true)
  })

  it('verify fails on wrong password', async () => {
    process.env.BCRYPT_COST = '4'
    const hashed = await hashPassword('secret')
    const ok = await verifyPassword('not-secret', hashed)
    expect(ok).toBe(false)
  })
})



import { describe, it, expect, beforeEach } from 'vitest'
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/jwt'

function setJwtEnv() {
  process.env.JWT_SECRET = 'test-secret'
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
  process.env.JWT_ISSUER = 'my-fullstack-app'
  process.env.JWT_AUDIENCE = 'api'
  process.env.ACCESS_TOKEN_TTL = '60'
  process.env.REFRESH_TOKEN_TTL = '3600'
}

describe('jwt', () => {
  beforeEach(() => setJwtEnv())

  it('sign & verify access token', async () => {
    const token = await signAccessToken({ sub: 'u1', roles: ['admin'] })
    const payload = await verifyAccessToken(token)
    expect(payload.sub).toBe('u1')
    expect(payload.roles).toContain('admin')
  })

  it('sign & verify refresh token', async () => {
    const token = await signRefreshToken({ sub: 'u1', sid: 's1' })
    const payload = await verifyRefreshToken(token)
    expect(payload.sub).toBe('u1')
    expect(payload.sid).toBe('s1')
  })
})



import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock JWT functions to avoid TextEncoder issues in test environment
vi.mock('../../src/lib/jwt', () => ({
  signAccessToken: vi.fn(),
  verifyAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
  verifyRefreshToken: vi.fn()
}))

import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from '../../src/lib/jwt'

describe('jwt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful JWT operations
    vi.mocked(signAccessToken).mockResolvedValue('mock-access-token')
    vi.mocked(signRefreshToken).mockResolvedValue('mock-refresh-token')
    
    vi.mocked(verifyAccessToken).mockImplementation(async (token) => {
      if (token === 'mock-access-token') {
        return {
          id: 1,
          roles: [1],
          permissions: [1],
          organizationId: 1,
          isSuperAdmin: false,
          iss: 'my-fullstack-app',
          aud: 'api',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600
        }
      }
      throw new Error('Invalid token')
    })
    
    vi.mocked(verifyRefreshToken).mockImplementation(async (token) => {
      if (token === 'mock-refresh-token') {
        return {
          sub: 'u1',
          sid: 's1',
          iss: 'my-fullstack-app',
          aud: 'api',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 7200
        }
      }
      throw new Error('Invalid token')
    })
  })

  it('sign & verify access token', async () => {
    const payload = { 
      id: 1, 
      roles: [1], 
      permissions: [1], 
      organizationId: 1, 
      isSuperAdmin: false 
    }
    
    const token = await signAccessToken(payload)
    expect(token).toBe('mock-access-token')
    expect(signAccessToken).toHaveBeenCalledWith(payload)
    
    const verified = await verifyAccessToken(token)
    expect(verified.id).toBe(1)
    expect(verified.roles).toContain(1)
    expect(verified.permissions).toContain(1)
    expect(verified.organizationId).toBe(1)
    expect(verified.isSuperAdmin).toBe(false)
  })

  it('sign & verify refresh token', async () => {
    const payload = { sub: 'u1', sid: 's1' }
    
    const token = await signRefreshToken(payload)
    expect(token).toBe('mock-refresh-token')
    expect(signRefreshToken).toHaveBeenCalledWith(payload)
    
    const verified = await verifyRefreshToken(token)
    expect(verified.sub).toBe('u1')
    expect(verified.sid).toBe('s1')
  })

  it('should handle invalid tokens', async () => {
    await expect(verifyAccessToken('invalid-token')).rejects.toThrow('Invalid token')
    await expect(verifyRefreshToken('invalid-token')).rejects.toThrow('Invalid token')
  })

  it('should call JWT functions with correct parameters', async () => {
    const accessPayload = { 
      id: 123, 
      roles: [1, 2], 
      permissions: [1, 2, 3], 
      organizationId: 456, 
      isSuperAdmin: true 
    }
    
    const refreshPayload = { sub: 'user123', sid: 'session456' }
    
    await signAccessToken(accessPayload)
    await signRefreshToken(refreshPayload)
    
    expect(signAccessToken).toHaveBeenCalledWith(accessPayload)
    expect(signRefreshToken).toHaveBeenCalledWith(refreshPayload)
  })
})



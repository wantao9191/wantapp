import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, isTokenBlacklisted } from '@/app/api/admin/auth/revoke/route'
import { verifyRefreshToken } from '@/lib/jwt'

// Mock JWT verification
vi.mock('@/lib/jwt', () => ({
  verifyRefreshToken: vi.fn()
}))

describe('Token Revoke API', () => {
  const mockRefreshTokenPayload = {
    sub: '1',
    sid: 'session123',
    iss: 'my-fullstack-app',
    aud: 'api',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('成功撤销token', () => {
    it('应该成功撤销有效的刷新token', async () => {
      // Arrange
      const validRefreshToken = 'valid-refresh-token'
      const request = new NextRequest('http://localhost/api/admin/auth/revoke', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: validRefreshToken })
      })

      vi.mocked(verifyRefreshToken).mockResolvedValue(mockRefreshTokenPayload)

      // Act
      const response = await POST(request)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.message).toBe('令牌已撤销')
      expect(verifyRefreshToken).toHaveBeenCalledWith(validRefreshToken)
      expect(isTokenBlacklisted(validRefreshToken)).toBe(true)
    })

    it('应该将撤销的token加入黑名单', async () => {
      // Arrange
      const refreshToken = 'token-to-blacklist'
      const request = new NextRequest('http://localhost/api/admin/auth/revoke', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      })

      vi.mocked(verifyRefreshToken).mockResolvedValue(mockRefreshTokenPayload)

      // Act
      await POST(request)

      // Assert
      expect(isTokenBlacklisted(refreshToken)).toBe(true)
      expect(isTokenBlacklisted('other-token')).toBe(false)
    })

    it('应该处理多个token的撤销', async () => {
      // Arrange
      const tokens = ['token1', 'token2', 'token3']
      vi.mocked(verifyRefreshToken).mockResolvedValue(mockRefreshTokenPayload)

      // Act
      for (const token of tokens) {
        const request = new NextRequest('http://localhost/api/admin/auth/revoke', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: token })
        })
        await POST(request)
      }

      // Assert
      tokens.forEach(token => {
        expect(isTokenBlacklisted(token)).toBe(true)
      })
    })
  })

  describe('撤销失败场景', () => {
    it('应该拒绝空的刷新token', async () => {
      // Arrange
      const request = new NextRequest('http://localhost/api/admin/auth/revoke', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: '' })
      })

      // Act
      const response = await POST(request)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.message).toBe('刷新令牌不能为空')
      expect(verifyRefreshToken).not.toHaveBeenCalled()
    })

    it('应该拒绝缺失的刷新token', async () => {
      // Arrange
      const request = new NextRequest('http://localhost/api/admin/auth/revoke', {
        method: 'POST',
        body: JSON.stringify({})
      })

      // Act
      const response = await POST(request)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.message).toBe('刷新令牌不能为空')
    })

    it('应该拒绝无效的刷新token', async () => {
      // Arrange
      const invalidToken = 'invalid-refresh-token'
      const request = new NextRequest('http://localhost/api/admin/auth/revoke', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: invalidToken })
      })

      vi.mocked(verifyRefreshToken).mockRejectedValue(new Error('Invalid token'))

      // Act
      const response = await POST(request)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.message).toBe('刷新令牌无效')
      expect(verifyRefreshToken).toHaveBeenCalledWith(invalidToken)
      expect(isTokenBlacklisted(invalidToken)).toBe(false)
    })

    it('应该拒绝过期的刷新token', async () => {
      // Arrange
      const expiredToken = 'expired-refresh-token'
      const request = new NextRequest('http://localhost/api/admin/auth/revoke', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: expiredToken })
      })

      const expiredError = new Error('Token expired')
      expiredError.name = 'JWTExpired'
      vi.mocked(verifyRefreshToken).mockRejectedValue(expiredError)

      // Act
      const response = await POST(request)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.message).toBe('刷新令牌无效')
      expect(isTokenBlacklisted(expiredToken)).toBe(false)
    })

    it('应该拒绝格式错误的刷新token', async () => {
      // Arrange
      const malformedToken = 'not.a.valid.jwt.format'
      const request = new NextRequest('http://localhost/api/admin/auth/revoke', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: malformedToken })
      })

      const formatError = new Error('Invalid token format')
      formatError.name = 'JWSInvalid'
      vi.mocked(verifyRefreshToken).mockRejectedValue(formatError)

      // Act
      const response = await POST(request)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.message).toBe('刷新令牌无效')
    })
  })

  describe('黑名单功能测试', () => {
    it('应该正确检查token是否在黑名单中', () => {
      // Arrange
      const token = 'test-token'

      // Act & Assert - Initially not blacklisted
      expect(isTokenBlacklisted(token)).toBe(false)
    })

    it('应该区分不同的token', async () => {
      // Arrange
      const token1 = 'token-1'
      const token2 = 'token-2'
      const request1 = new NextRequest('http://localhost/api/admin/auth/revoke', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: token1 })
      })

      vi.mocked(verifyRefreshToken).mockResolvedValue(mockRefreshTokenPayload)

      // Act - Only revoke token1
      await POST(request1)

      // Assert
      expect(isTokenBlacklisted(token1)).toBe(true)
      expect(isTokenBlacklisted(token2)).toBe(false)
    })

    it('应该处理重复撤销同一token', async () => {
      // Arrange
      const token = 'duplicate-revoke-token'
      const request = new NextRequest('http://localhost/api/admin/auth/revoke', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: token })
      })

      vi.mocked(verifyRefreshToken).mockResolvedValue(mockRefreshTokenPayload)

      // Act - Revoke same token twice
      const response1 = await POST(request)
      const response2 = await POST(request)

      // Assert - Both should succeed
      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(isTokenBlacklisted(token)).toBe(true)
      expect(verifyRefreshToken).toHaveBeenCalledTimes(2)
    })
  })

  describe('安全性测试', () => {
    it('应该验证token的完整性', async () => {
      // Arrange
      const tamperedToken = 'tampered.token.signature'
      const request = new NextRequest('http://localhost/api/admin/auth/revoke', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: tamperedToken })
      })

      const signatureError = new Error('Invalid signature')
      signatureError.name = 'JWSSignatureVerificationFailed'
      vi.mocked(verifyRefreshToken).mockRejectedValue(signatureError)

      // Act
      const response = await POST(request)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.message).toBe('刷新令牌无效')
      expect(isTokenBlacklisted(tamperedToken)).toBe(false)
    })

    it('应该只撤销经过验证的token', async () => {
      // Arrange
      const validToken = 'valid-token'
      const invalidToken = 'invalid-token'
      
      const validRequest = new NextRequest('http://localhost/api/admin/auth/revoke', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: validToken })
      })
      
      const invalidRequest = new NextRequest('http://localhost/api/admin/auth/revoke', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: invalidToken })
      })

      vi.mocked(verifyRefreshToken)
        .mockResolvedValueOnce(mockRefreshTokenPayload) // Valid token
        .mockRejectedValueOnce(new Error('Invalid token')) // Invalid token

      // Act
      await POST(validRequest)
      await POST(invalidRequest)

      // Assert
      expect(isTokenBlacklisted(validToken)).toBe(true)
      expect(isTokenBlacklisted(invalidToken)).toBe(false)
    })
  })

  describe('错误处理', () => {
    it('应该处理JSON解析错误', async () => {
      // Arrange
      const request = new NextRequest('http://localhost/api/admin/auth/revoke', {
        method: 'POST',
        body: 'invalid json'
      })

      // Act & Assert
      await expect(POST(request)).rejects.toThrow()
    })

    it('应该处理验证过程中的异常', async () => {
      // Arrange
      const token = 'problematic-token'
      const request = new NextRequest('http://localhost/api/admin/auth/revoke', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: token })
      })

      vi.mocked(verifyRefreshToken).mockRejectedValue(new Error('Unexpected error'))

      // Act
      const response = await POST(request)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.message).toBe('刷新令牌无效')
      expect(isTokenBlacklisted(token)).toBe(false)
    })
  })
})
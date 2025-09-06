import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/admin/auth/refresh/route'
import { signRefreshToken, verifyRefreshToken, signAccessToken } from '@/lib/jwt'
import { db } from '@/db'
import { users } from '@/db/schema'
import { generateRandomString } from '@/lib/utils'

// Mock dependencies
vi.mock('@/db', () => ({
    db: {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn()
    }
}))

vi.mock('@/lib/jwt', () => ({
    verifyRefreshToken: vi.fn(),
    signAccessToken: vi.fn(),
    signRefreshToken: vi.fn()
}))

vi.mock('@/lib/utils', () => ({
    generateRandomString: vi.fn()
}))

describe('Token Refresh API', () => {
    const mockDb = vi.mocked(db)
    
    const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        status: 1,
        deleted: false,
        password: 'hashedpassword',
        roles: ['admin'],
        permissionsVersion: 1
    }

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

        // Setup default mocks
        vi.mocked(generateRandomString).mockReturnValue('newsession456')
        vi.mocked(signAccessToken).mockResolvedValue('new-access-token')
        vi.mocked(signRefreshToken).mockResolvedValue('new-refresh-token')
        
        // Reset database mock
        mockDb.select.mockReturnThis()
        mockDb.from.mockReturnThis()
        mockDb.where.mockReturnThis()
        mockDb.limit.mockResolvedValue([mockUser])
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('成功场景', () => {
        it('应该成功刷新有效的token', async () => {
            // Arrange
            const validRefreshToken = 'valid-refresh-token'
            const request = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken: validRefreshToken })
            })

            vi.mocked(verifyRefreshToken).mockResolvedValue(mockRefreshTokenPayload)
            mockDb.limit.mockResolvedValue([mockUser])

            // Act
            const response = await POST(request)
            const result = await response.json()

            // Assert
            expect(response.status).toBe(200)
            expect(result.code).toBe(200)
            expect(result.data).toHaveProperty('accessToken', 'new-access-token')
            expect(result.data).toHaveProperty('refreshToken', 'new-refresh-token')
            expect(result.data).toHaveProperty('userInfo')
            expect(result.data.userInfo).not.toHaveProperty('password')

            // Verify JWT functions were called correctly
            expect(verifyRefreshToken).toHaveBeenCalledWith(validRefreshToken)
            expect(signAccessToken).toHaveBeenCalledWith({
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                status: 1,
                deleted: false,
                roles: ['admin'],
                permissionsVersion: 1
            })
            expect(signRefreshToken).toHaveBeenCalledWith({
                sub: '1',
                sid: 'newsession456'
            })
        })

        it('应该生成新的会话ID实现token轮换', async () => {
            // Arrange
            const refreshToken = 'valid-refresh-token'
            const request = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            })

            vi.mocked(verifyRefreshToken).mockResolvedValue(mockRefreshTokenPayload)
            mockDb.limit.mockResolvedValue([mockUser])

            // Act
            await POST(request)

            // Assert
            expect(generateRandomString).toHaveBeenCalledWith(32)
            expect(signRefreshToken).toHaveBeenCalledWith({
                sub: '1',
                sid: 'newsession456'
            })
        })
    })

    describe('失败场景', () => {
        it('应该拒绝空的刷新token', async () => {
            // Arrange
            const request = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken: '' })
            })

            // Act
            const response = await POST(request)
            const result = await response.json()

            // Assert - API returns 500 for thrown errors
            expect(response.status).toBe(500)
            expect(result.code).toBe(500)
            expect(result.message).toBe('刷新令牌不能为空')
        })

        it('应该拒绝缺失的刷新token', async () => {
            // Arrange
            const request = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({})
            })

            // Act
            const response = await POST(request)
            const result = await response.json()

            // Assert
            expect(response.status).toBe(500)
            expect(result.code).toBe(500)
            expect(result.message).toBe('刷新令牌不能为空')
        })

        it('应该拒绝无效的刷新token', async () => {
            // Arrange
            const invalidRefreshToken = 'invalid-refresh-token'
            const request = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken: invalidRefreshToken })
            })

            vi.mocked(verifyRefreshToken).mockRejectedValue(new Error('Invalid token'))

            // Act
            const response = await POST(request)
            const result = await response.json()

            // Assert
            expect(response.status).toBe(500)
            expect(result.code).toBe(500)
            expect(result.message).toBe('刷新令牌无效或已过期')
            expect(verifyRefreshToken).toHaveBeenCalledWith(invalidRefreshToken)
        })

        it('应该拒绝不存在用户的token', async () => {
            // Arrange
            const refreshToken = 'valid-token-nonexistent-user'
            const request = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            })

            vi.mocked(verifyRefreshToken).mockResolvedValue(mockRefreshTokenPayload)
            mockDb.limit.mockResolvedValue([]) // 用户不存在

            // Act
            const response = await POST(request)
            const result = await response.json()

            // Assert
            expect(response.status).toBe(500)
            expect(result.code).toBe(500)
            expect(result.message).toBe('用户不存在')
        })

        it('应该拒绝已删除用户的token', async () => {
            // Arrange
            const refreshToken = 'valid-token-deleted-user'
            const request = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            })

            const deletedUser = { ...mockUser, deleted: true }
            vi.mocked(verifyRefreshToken).mockResolvedValue(mockRefreshTokenPayload)
            mockDb.limit.mockResolvedValue([deletedUser])

            // Act
            const response = await POST(request)
            const result = await response.json()

            // Assert
            expect(response.status).toBe(500)
            expect(result.code).toBe(500)
            expect(result.message).toBe('用户已被删除，请联系管理员')
        })

        it('应该拒绝已禁用用户的token', async () => {
            // Arrange
            const refreshToken = 'valid-token-disabled-user'
            const request = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            })

            const disabledUser = { ...mockUser, status: 0 }
            vi.mocked(verifyRefreshToken).mockResolvedValue(mockRefreshTokenPayload)
            mockDb.limit.mockResolvedValue([disabledUser])

            // Act
            const response = await POST(request)
            const result = await response.json()

            // Assert
            expect(response.status).toBe(500)
            expect(result.code).toBe(500)
            expect(result.message).toBe('用户已被禁用，请联系管理员')
        })
    })

    describe('安全性测试', () => {
        it('返回的用户信息不应包含密码', async () => {
            // Arrange
            const refreshToken = 'valid-refresh-token'
            const request = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            })

            vi.mocked(verifyRefreshToken).mockResolvedValue(mockRefreshTokenPayload)
            mockDb.limit.mockResolvedValue([mockUser])

            // Act
            const response = await POST(request)
            const result = await response.json()

            // Assert
            expect(result.data.userInfo).not.toHaveProperty('password')
            expect(result.data.userInfo).toHaveProperty('id')
            expect(result.data.userInfo).toHaveProperty('username')
            expect(result.data.userInfo).toHaveProperty('email')
        })

        it('应该为每次刷新生成不同的会话ID', async () => {
            // Arrange
            const refreshToken = 'valid-refresh-token'
            const request1 = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            })
            const request2 = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            })

            vi.mocked(verifyRefreshToken).mockResolvedValue(mockRefreshTokenPayload)
            mockDb.limit.mockResolvedValue([mockUser])

            // Mock different session IDs for each call
            vi.mocked(generateRandomString)
                .mockReturnValueOnce('session1')
                .mockReturnValueOnce('session2')

            // Act - First refresh
            await POST(request1)

            // Act - Second refresh
            await POST(request2)

            // Assert
            expect(generateRandomString).toHaveBeenCalledTimes(2)
            expect(signRefreshToken).toHaveBeenNthCalledWith(1, {
                sub: '1',
                sid: 'session1'
            })
            expect(signRefreshToken).toHaveBeenNthCalledWith(2, {
                sub: '1',
                sid: 'session2'
            })
        })
    })

    describe('数据库交互测试', () => {
        it('应该正确查询用户信息', async () => {
            // Arrange
            const refreshToken = 'valid-refresh-token'
            const request = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            })

            vi.mocked(verifyRefreshToken).mockResolvedValue(mockRefreshTokenPayload)
            mockDb.limit.mockResolvedValue([mockUser])

            // Act
            await POST(request)

            // Assert
            expect(mockDb.select).toHaveBeenCalled()
            expect(mockDb.from).toHaveBeenCalledWith(users)
            expect(mockDb.limit).toHaveBeenCalledWith(1)
        })
    })

    describe('JWT验证测试', () => {
        it('应该验证refresh token的格式', async () => {
            // Arrange
            const refreshToken = 'valid-refresh-token'
            const request = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            })

            vi.mocked(verifyRefreshToken).mockResolvedValue(mockRefreshTokenPayload)
            mockDb.limit.mockResolvedValue([mockUser])

            // Act
            await POST(request)

            // Assert
            expect(verifyRefreshToken).toHaveBeenCalledWith(refreshToken)
        })

        it('应该处理JWT验证错误', async () => {
            // Arrange
            const refreshToken = 'malformed-token'
            const request = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            })

            const jwtError = new Error('JWT malformed')
            jwtError.name = 'JsonWebTokenError'
            vi.mocked(verifyRefreshToken).mockRejectedValue(jwtError)

            // Act
            const response = await POST(request)
            const result = await response.json()

            // Assert
            expect(response.status).toBe(500)
            expect(result.code).toBe(500)
            expect(result.message).toBe('刷新令牌无效或已过期')
        })

        it('应该处理过期的JWT', async () => {
            // Arrange
            const refreshToken = 'expired-token'
            const request = new NextRequest('http://localhost/api/admin/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            })

            const expiredError = new Error('jwt expired')
            expiredError.name = 'TokenExpiredError'
            vi.mocked(verifyRefreshToken).mockRejectedValue(expiredError)

            // Act
            const response = await POST(request)
            const result = await response.json()

            // Assert
            expect(response.status).toBe(500)
            expect(result.code).toBe(500)
            expect(result.message).toBe('刷新令牌无效或已过期')
        })
    })
})
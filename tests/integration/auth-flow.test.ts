import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '../../src/middleware'
import { POST as loginPOST } from '../../src/app/api/admin/auth/login/route'

// Mock all dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn()
}))

vi.mock('@/lib/jwt', () => ({
  verifyAccessToken: vi.fn(),
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn()
}))

vi.mock('@/lib/crypto', () => ({
  decryptJson: vi.fn()
}))

vi.mock('@/lib/validations', () => ({
  loginSchema: {
    safeParse: vi.fn()
  }
}))

vi.mock('@/db', () => ({
  db: {
    select: vi.fn()
  }
}))

vi.mock('@/db/schema', () => ({
  users: {},
  roles: {},
  permissions: {}
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  inArray: vi.fn()
}))

vi.mock('@/lib/password', () => ({
  verifyPassword: vi.fn()
}))

vi.mock('@/lib/utils', () => ({
  generateRandomString: vi.fn()
}))

vi.mock('@/lib/permissions', () => ({
  getUserPermissions: vi.fn(),
  isSuperAdmin: vi.fn()
}))

describe('认证流程集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('完整的登录到API访问流程', () => {
    it('应该完成完整的认证流程', async () => {
      // 1. 模拟登录请求
      const mockCookies = {
        get: vi.fn().mockReturnValue({ value: 'encrypted-captcha' }),
        delete: vi.fn()
      }
      
      const { cookies } = await import('next/headers')
      vi.mocked(cookies).mockResolvedValue(mockCookies)

      const { decryptJson } = await import('@/lib/crypto')
      vi.mocked(decryptJson).mockResolvedValue({
        code: '1234',
        expires: Date.now() + 300000
      })

      const { loginSchema } = await import('@/lib/validations')
      vi.mocked(loginSchema.safeParse).mockReturnValue({
        success: true,
        data: {
          username: 'admin',
          password: 'password123',
          code: '1234'
        }
      })

      const { db } = await import('@/db')
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 1,
              username: 'admin',
              password: 'hashed-password',
              roles: [1, 2],
              organizationId: 1,
              deleted: false,
              status: 1
            }])
          })
        })
      })

      const { verifyPassword } = await import('@/lib/password')
      vi.mocked(verifyPassword).mockResolvedValue(true)

      const { signAccessToken, signRefreshToken } = await import('@/lib/jwt')
      vi.mocked(signAccessToken).mockResolvedValue('test-access-token')
      vi.mocked(signRefreshToken).mockResolvedValue('test-refresh-token')

      const { generateRandomString } = await import('@/lib/utils')
      vi.mocked(generateRandomString).mockReturnValue('session-id')

      const { getUserPermissions, isSuperAdmin } = await import('@/lib/permissions')
      vi.mocked(getUserPermissions).mockResolvedValue([1, 2, 3])
      vi.mocked(isSuperAdmin).mockResolvedValue(false)

      // 执行登录
      const loginRequest = new NextRequest('http://localhost:3000/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'admin',
          password: 'password123',
          code: '1234'
        })
      })

      const loginResponse = await loginPOST(loginRequest)
      const loginBody = await loginResponse.json()

      // 验证登录成功
      expect(loginResponse.status).toBe(200)
      expect(loginBody.data.accessToken).toBe('test-access-token')
      expect(loginBody.data.refreshToken).toBe('test-refresh-token')

      // 2. 使用获得的token访问受保护的API
      const { verifyAccessToken } = await import('@/lib/jwt')
      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 1,
        roles: [1, 2],
        permissions: [1, 2, 3],
        organizationId: 1,
        isSuperAdmin: false
      })

      const protectedRequest = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${loginBody.data.accessToken}`
        }
      })

      const middlewareResponse = await middleware(protectedRequest)

      // 验证中间件允许访问
      expect(middlewareResponse.status).not.toBe(401)
      expect(middlewareResponse.status).not.toBe(403)
      expect(verifyAccessToken).toHaveBeenCalledWith('test-access-token')
    })

    it('应该拒绝无效token的API访问', async () => {
      const { verifyAccessToken } = await import('@/lib/jwt')
      vi.mocked(verifyAccessToken).mockRejectedValue(new Error('Invalid token'))

      const protectedRequest = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      })

      const middlewareResponse = await middleware(protectedRequest)

      expect(middlewareResponse.status).toBe(401)
      const body = await middlewareResponse.json()
      expect(body.message).toBe('Invalid token')
    })

    it('应该拒绝过期token的API访问', async () => {
      const { verifyAccessToken } = await import('@/lib/jwt')
      vi.mocked(verifyAccessToken).mockRejectedValue({ code: 'ERR_JWT_EXPIRED' })

      const protectedRequest = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': 'Bearer expired-token'
        }
      })

      const middlewareResponse = await middleware(protectedRequest)

      expect(middlewareResponse.status).toBe(401)
      const body = await middlewareResponse.json()
      expect(body.message).toBe('Token expired')
    })
  })

  describe('登录失败场景', () => {
    it('应该在验证码错误时拒绝登录', async () => {
      const mockCookies = {
        get: vi.fn().mockReturnValue({ value: 'encrypted-captcha' }),
        delete: vi.fn()
      }
      
      const { cookies } = await import('next/headers')
      vi.mocked(cookies).mockResolvedValue(mockCookies)

      const { decryptJson } = await import('@/lib/crypto')
      vi.mocked(decryptJson).mockResolvedValue({
        code: '5678', // 错误的验证码
        expires: Date.now() + 300000
      })

      const { loginSchema } = await import('@/lib/validations')
      vi.mocked(loginSchema.safeParse).mockReturnValue({
        success: true,
        data: {
          username: 'admin',
          password: 'password123',
          code: '1234' // 用户输入的验证码
        }
      })

      const loginRequest = new NextRequest('http://localhost:3000/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'admin',
          password: 'password123',
          code: '1234'
        })
      })

      const loginResponse = await loginPOST(loginRequest)
      const loginBody = await loginResponse.json()

      expect(loginResponse.status).toBe(500)
      expect(loginBody.message).toBe('验证码错误')
    })

    it('应该在密码错误时拒绝登录', async () => {
      const mockCookies = {
        get: vi.fn().mockReturnValue({ value: 'encrypted-captcha' }),
        delete: vi.fn()
      }
      
      const { cookies } = await import('next/headers')
      vi.mocked(cookies).mockResolvedValue(mockCookies)

      const { decryptJson } = await import('@/lib/crypto')
      vi.mocked(decryptJson).mockResolvedValue({
        code: '1234',
        expires: Date.now() + 300000
      })

      const { loginSchema } = await import('@/lib/validations')
      vi.mocked(loginSchema.safeParse).mockReturnValue({
        success: true,
        data: {
          username: 'admin',
          password: 'wrong-password',
          code: '1234'
        }
      })

      const { db } = await import('@/db')
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 1,
              username: 'admin',
              password: 'hashed-password',
              roles: [1],
              organizationId: 1,
              deleted: false,
              status: 1
            }])
          })
        })
      })

      const { verifyPassword } = await import('@/lib/password')
      vi.mocked(verifyPassword).mockResolvedValue(false) // 密码验证失败

      const loginRequest = new NextRequest('http://localhost:3000/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'admin',
          password: 'wrong-password',
          code: '1234'
        })
      })

      const loginResponse = await loginPOST(loginRequest)
      const loginBody = await loginResponse.json()

      expect(loginResponse.status).toBe(500)
      expect(loginBody.message).toBe('密码错误')
    })
  })

  describe('权限控制场景', () => {
    it('应该允许超级管理员访问所有API', async () => {
      const { verifyAccessToken } = await import('@/lib/jwt')
      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 1,
        roles: [1],
        permissions: [],
        organizationId: null,
        isSuperAdmin: true
      })

      const protectedRequest = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': 'Bearer super-admin-token'
        }
      })

      const middlewareResponse = await middleware(protectedRequest)

      expect(middlewareResponse.status).not.toBe(401)
      expect(middlewareResponse.status).not.toBe(403)
    })

    it('应该允许有通配符权限的用户访问所有API', async () => {
      const { verifyAccessToken } = await import('@/lib/jwt')
      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 2,
        roles: [2],
        permissions: ['*'],
        organizationId: 1,
        isSuperAdmin: false
      })

      const protectedRequest = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': 'Bearer wildcard-token'
        }
      })

      const middlewareResponse = await middleware(protectedRequest)

      expect(middlewareResponse.status).not.toBe(401)
      expect(middlewareResponse.status).not.toBe(403)
    })
  })

  describe('CORS处理', () => {
    it('应该正确处理CORS预检请求', async () => {
      const optionsRequest = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000'
        }
      })

      const middlewareResponse = await middleware(optionsRequest)

      expect(middlewareResponse.status).toBe(200)
      expect(middlewareResponse.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(middlewareResponse.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(middlewareResponse.headers.get('Access-Control-Allow-Headers')).toContain('Authorization')
    })

    it('应该在API响应中设置CORS头', async () => {
      const { verifyAccessToken } = await import('@/lib/jwt')
      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 1,
        roles: [1],
        permissions: [1],
        organizationId: 1,
        isSuperAdmin: false
      })

      const protectedRequest = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': 'Bearer valid-token',
          'Origin': 'http://localhost:3000'
        }
      })

      const middlewareResponse = await middleware(protectedRequest)

      expect(middlewareResponse.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })
  })

  describe('公共API访问', () => {
    it('应该允许访问公共API而不需要认证', async () => {
      const publicPaths = [
        '/api/captcha',
        '/api/admin/auth/login',
        '/api/admin/auth/refresh',
        '/api/admin/auth/revoke'
      ]

      for (const path of publicPaths) {
        const publicRequest = new NextRequest(`http://localhost:3000${path}`)
        const middlewareResponse = await middleware(publicRequest)

        expect(middlewareResponse.status).not.toBe(401)
        expect(middlewareResponse.headers.get('Access-Control-Allow-Origin')).toBe('*')
      }
    })

    it('应该允许访问非admin API', async () => {
      const nonAdminRequest = new NextRequest('http://localhost:3000/api/health')
      const middlewareResponse = await middleware(nonAdminRequest)

      expect(middlewareResponse.status).not.toBe(401)
    })
  })

  describe('错误处理', () => {
    it('应该处理JWT验证中的网络错误', async () => {
      const { verifyAccessToken } = await import('@/lib/jwt')
      vi.mocked(verifyAccessToken).mockRejectedValue(new Error('Network error'))

      const protectedRequest = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': 'Bearer network-error-token'
        }
      })

      const middlewareResponse = await middleware(protectedRequest)

      expect(middlewareResponse.status).toBe(401)
      const body = await middlewareResponse.json()
      expect(body.message).toBe('Invalid token')
    })

    it('应该处理登录过程中的数据库错误', async () => {
      const mockCookies = {
        get: vi.fn().mockReturnValue({ value: 'encrypted-captcha' }),
        delete: vi.fn()
      }
      
      const { cookies } = await import('next/headers')
      vi.mocked(cookies).mockResolvedValue(mockCookies)

      const { decryptJson } = await import('@/lib/crypto')
      vi.mocked(decryptJson).mockResolvedValue({
        code: '1234',
        expires: Date.now() + 300000
      })

      const { loginSchema } = await import('@/lib/validations')
      vi.mocked(loginSchema.safeParse).mockReturnValue({
        success: true,
        data: {
          username: 'admin',
          password: 'password123',
          code: '1234'
        }
      })

      const { db } = await import('@/db')
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error('Database connection failed'))
          })
        })
      })

      const loginRequest = new NextRequest('http://localhost:3000/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'admin',
          password: 'password123',
          code: '1234'
        })
      })

      const loginResponse = await loginPOST(loginRequest)
      const loginBody = await loginResponse.json()

      expect(loginResponse.status).toBe(500)
      expect(loginBody.message).toBe('Database connection failed')
    })
  })

  describe('边界情况', () => {
    it('应该处理非常长的token', async () => {
      const longToken = 'a'.repeat(2000)
      const { verifyAccessToken } = await import('@/lib/jwt')
      vi.mocked(verifyAccessToken).mockRejectedValue(new Error('Token too long'))

      const protectedRequest = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${longToken}`
        }
      })

      const middlewareResponse = await middleware(protectedRequest)

      expect(middlewareResponse.status).toBe(401)
      expect(verifyAccessToken).toHaveBeenCalledWith(longToken)
    })

    it('应该处理空的Authorization头', async () => {
      const protectedRequest = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': ''
        }
      })

      const middlewareResponse = await middleware(protectedRequest)

      expect(middlewareResponse.status).toBe(401)
      const body = await middlewareResponse.json()
      expect(body.message).toBe('Missing or invalid Authorization header')
    })

    it('应该处理格式错误的Authorization头', async () => {
      const protectedRequest = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': 'Basic invalid-format'
        }
      })

      const middlewareResponse = await middleware(protectedRequest)

      expect(middlewareResponse.status).toBe(401)
      const body = await middlewareResponse.json()
      expect(body.message).toBe('Missing or invalid Authorization header')
    })
  })
})
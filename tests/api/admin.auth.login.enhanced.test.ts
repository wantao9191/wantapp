import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../../src/app/api/admin/auth/login/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn()
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

vi.mock('@/lib/jwt', () => ({
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn()
}))

vi.mock('@/lib/utils', () => ({
  generateRandomString: vi.fn()
}))

vi.mock('@/lib/permissions', () => ({
  getUserPermissions: vi.fn(),
  isSuperAdmin: vi.fn()
}))

describe('/api/admin/auth/login - Enhanced Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该成功登录并返回完整的用户信息', async () => {
    // Mock implementations
    const mockCookies = {
      get: vi.fn().mockReturnValue({ value: 'encrypted-captcha' }),
      delete: vi.fn()
    }
    
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValue(mockCookies)

    const { decryptJson } = await import('@/lib/crypto')
    vi.mocked(decryptJson).mockResolvedValue({
      code: '1234',
      expires: Date.now() + 300000 // 5分钟后过期
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
            status: 1,
            email: 'admin@example.com',
            name: 'Administrator'
          }])
        })
      })
    })

    const { verifyPassword } = await import('@/lib/password')
    vi.mocked(verifyPassword).mockResolvedValue(true)

    const { signAccessToken, signRefreshToken } = await import('@/lib/jwt')
    vi.mocked(signAccessToken).mockResolvedValue('access-token')
    vi.mocked(signRefreshToken).mockResolvedValue('refresh-token')

    const { generateRandomString } = await import('@/lib/utils')
    vi.mocked(generateRandomString).mockReturnValue('session-id')

    const { getUserPermissions, isSuperAdmin } = await import('@/lib/permissions')
    vi.mocked(getUserPermissions).mockResolvedValue([1, 2, 3])
    vi.mocked(isSuperAdmin).mockResolvedValue(false)

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'password123',
        code: '1234'
      })
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.code).toBe(200)
    expect(body.data).toHaveProperty('accessToken', 'access-token')
    expect(body.data).toHaveProperty('refreshToken', 'refresh-token')
    expect(body.data).toHaveProperty('userInfo')
    
    // 验证用户信息不包含密码
    expect(body.data.userInfo).not.toHaveProperty('password')
    expect(body.data.userInfo).toHaveProperty('id', 1)
    expect(body.data.userInfo).toHaveProperty('username', 'admin')
    expect(body.data.userInfo).toHaveProperty('email', 'admin@example.com')
  })

  it('应该在验证码错误时返回错误', async () => {
    const mockCookies = {
      get: vi.fn().mockReturnValue({ value: 'encrypted-captcha' }),
      delete: vi.fn()
    }
    
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValue(mockCookies)

    const { decryptJson } = await import('@/lib/crypto')
    vi.mocked(decryptJson).mockResolvedValue({
      code: '5678',
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

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'password123',
        code: '1234'
      })
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.message).toBe('验证码错误')
  })

  it('应该在验证码过期时返回错误', async () => {
    const mockCookies = {
      get: vi.fn().mockReturnValue({ value: 'encrypted-captcha' }),
      delete: vi.fn()
    }
    
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValue(mockCookies)

    const { decryptJson } = await import('@/lib/crypto')
    vi.mocked(decryptJson).mockResolvedValue({
      code: '1234',
      expires: Date.now() - 1000 // 已过期
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

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'password123',
        code: '1234'
      })
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.message).toBe('验证码已过期')
  })

  it('应该在用户不存在时返回错误', async () => {
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
        username: 'nonexistent',
        password: 'password123',
        code: '1234'
      }
    })

    const { db } = await import('@/db')
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]) // 用户不存在
        })
      })
    })

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'nonexistent',
        password: 'password123',
        code: '1234'
      })
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.message).toBe('用户不存在')
  })

  it('应该在用户被删除时返回错误', async () => {
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
        username: 'deleted-user',
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
            username: 'deleted-user',
            password: 'hashed-password',
            roles: [1],
            organizationId: 1,
            deleted: true, // 用户已删除
            status: 1
          }])
        })
      })
    })

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'deleted-user',
        password: 'password123',
        code: '1234'
      })
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.message).toBe('用户已被删除，请联系管理员')
  })

  it('应该在用户被禁用时返回错误', async () => {
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
        username: 'disabled-user',
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
            username: 'disabled-user',
            password: 'hashed-password',
            roles: [1],
            organizationId: 1,
            deleted: false,
            status: 0 // 用户被禁用
          }])
        })
      })
    })

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'disabled-user',
        password: 'password123',
        code: '1234'
      })
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.message).toBe('用户已被禁用，请联系管理员')
  })

  it('应该在密码错误时返回错误', async () => {
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
    vi.mocked(verifyPassword).mockResolvedValue(false) // 密码错误

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'wrong-password',
        code: '1234'
      })
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.message).toBe('密码错误')
  })

  it('应该在没有验证码cookie时返回错误', async () => {
    const mockCookies = {
      get: vi.fn().mockReturnValue(null), // 没有验证码cookie
      delete: vi.fn()
    }
    
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValue(mockCookies)

    const { loginSchema } = await import('@/lib/validations')
    vi.mocked(loginSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        username: 'admin',
        password: 'password123',
        code: '1234'
      }
    })

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'password123',
        code: '1234'
      })
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.message).toBe('验证码已过期')
  })

  it('应该在输入验证失败时返回错误', async () => {
    const { loginSchema } = await import('@/lib/validations')
    vi.mocked(loginSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        errors: [{ message: '用户名不能为空' }]
      }
    })

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: '',
        password: 'password123',
        code: '1234'
      })
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.message).toBe('用户名不能为空')
  })

  it('应该正确生成JWT token payload', async () => {
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
    vi.mocked(signAccessToken).mockResolvedValue('access-token')
    vi.mocked(signRefreshToken).mockResolvedValue('refresh-token')

    const { generateRandomString } = await import('@/lib/utils')
    vi.mocked(generateRandomString).mockReturnValue('session-id')

    const { getUserPermissions, isSuperAdmin } = await import('@/lib/permissions')
    vi.mocked(getUserPermissions).mockResolvedValue([1, 2, 3])
    vi.mocked(isSuperAdmin).mockResolvedValue(true)

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'password123',
        code: '1234'
      })
    })

    await POST(request)

    // 验证 signAccessToken 被正确调用
    expect(signAccessToken).toHaveBeenCalledWith({
      id: 1,
      roles: [1, 2],
      permissions: [1, 2, 3],
      organizationId: 1,
      isSuperAdmin: true
    })

    // 验证 signRefreshToken 被正确调用
    expect(signRefreshToken).toHaveBeenCalledWith({
      sub: '1',
      sid: 'session-id'
    })
  })

  it('应该正确删除验证码cookie', async () => {
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

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'password123',
        code: '1234'
      })
    })

    await POST(request)

    expect(mockCookies.delete).toHaveBeenCalledWith('captcha')
  })

  it('应该处理超级管理员登录', async () => {
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
        username: 'superadmin',
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
            username: 'superadmin',
            password: 'hashed-password',
            roles: [1],
            organizationId: null, // 超级管理员可能没有机构ID
            deleted: false,
            status: 1
          }])
        })
      })
    })

    const { verifyPassword } = await import('@/lib/password')
    vi.mocked(verifyPassword).mockResolvedValue(true)

    const { signAccessToken, signRefreshToken } = await import('@/lib/jwt')
    vi.mocked(signAccessToken).mockResolvedValue('super-access-token')
    vi.mocked(signRefreshToken).mockResolvedValue('super-refresh-token')

    const { generateRandomString } = await import('@/lib/utils')
    vi.mocked(generateRandomString).mockReturnValue('super-session-id')

    const { getUserPermissions, isSuperAdmin } = await import('@/lib/permissions')
    vi.mocked(getUserPermissions).mockResolvedValue([]) // 超级管理员可能不需要具体权限
    vi.mocked(isSuperAdmin).mockResolvedValue(true)

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'superadmin',
        password: 'password123',
        code: '1234'
      })
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.data.accessToken).toBe('super-access-token')
    expect(body.data.refreshToken).toBe('super-refresh-token')
    
    // 验证超级管理员的JWT payload
    expect(signAccessToken).toHaveBeenCalledWith({
      id: 1,
      roles: [1],
      permissions: [],
      organizationId: null,
      isSuperAdmin: true
    })
  })

  it('应该处理数据库查询错误', async () => {
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

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'password123',
        code: '1234'
      })
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.message).toBe('Database connection failed')
  })
})
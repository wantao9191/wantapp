import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '../src/middleware'

// Mock JWT functions
vi.mock('@/lib/jwt', () => ({
  verifyAccessToken: vi.fn()
}))

import { verifyAccessToken } from '@/lib/jwt'

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 默认JWT验证成功
    vi.mocked(verifyAccessToken).mockResolvedValue({
      id: 1,
      roles: [1],
      permissions: ['user:read'],
      isSuperAdmin: false
    })
  })

  describe('公共API路径', () => {
    const publicPaths = [
      '/api/captcha',
      '/api/admin/login',
      '/api/admin/auth/login',
      '/api/admin/auth/refresh',
      '/api/admin/auth/revoke'
    ]

    publicPaths.forEach(path => {
      it(`应该允许访问公共路径: ${path}`, async () => {
        const request = new NextRequest(`http://localhost:3000${path}`)
        const response = await middleware(request)
        
        expect(response.status).not.toBe(401)
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      })
    })

    it('应该允许访问公共路径的子路径', async () => {
      const request = new NextRequest('http://localhost:3000/api/captcha/generate')
      const response = await middleware(request)
      
      expect(response.status).not.toBe(401)
    })
  })

  describe('受保护的API路径', () => {
    it('应该要求认证头', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/users')
      const response = await middleware(request)
      
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.message).toBe('Missing or invalid Authorization header')
    })

    it('应该验证Bearer token格式', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { 'Authorization': 'Basic invalid' }
      })
      const response = await middleware(request)
      
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.message).toBe('Missing or invalid Authorization header')
    })

    it('应该验证JWT token', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })
      
      const response = await middleware(request)
      
      expect(verifyAccessToken).toHaveBeenCalledWith('valid-token')
      expect(response.status).not.toBe(401)
    })

    it('应该处理过期的token', async () => {
      vi.mocked(verifyAccessToken).mockRejectedValue({ code: 'ERR_JWT_EXPIRED' })
      
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { 'Authorization': 'Bearer expired-token' }
      })
      
      const response = await middleware(request)
      
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.message).toBe('Token expired')
    })

    it('应该处理无效的token格式', async () => {
      vi.mocked(verifyAccessToken).mockRejectedValue({ code: 'ERR_JWS_INVALID' })
      
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { 'Authorization': 'Bearer invalid-token' }
      })
      
      const response = await middleware(request)
      
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.message).toBe('Invalid token format')
    })

    it('应该处理token验证失败', async () => {
      vi.mocked(verifyAccessToken).mockRejectedValue({ code: 'ERR_JWT_CLAIM_VALIDATION_FAILED' })
      
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { 'Authorization': 'Bearer invalid-claims-token' }
      })
      
      const response = await middleware(request)
      
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.message).toBe('Token validation failed')
    })

    it('应该处理未知的JWT错误', async () => {
      vi.mocked(verifyAccessToken).mockRejectedValue(new Error('Unknown JWT error'))
      
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { 'Authorization': 'Bearer unknown-error-token' }
      })
      
      const response = await middleware(request)
      
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.message).toBe('Invalid token')
    })
  })

  describe('CORS处理', () => {
    it('应该处理OPTIONS预检请求', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'OPTIONS',
        headers: { 'Origin': 'http://localhost:3000' }
      })
      
      const response = await middleware(request)
      
      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization')
    })

    it('应该在开发环境设置通配符CORS', async () => {
      process.env.NODE_ENV = 'development'
      
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { 
          'Authorization': 'Bearer valid-token',
          'Origin': 'http://localhost:3000'
        }
      })
      
      const response = await middleware(request)
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('应该在生产环境验证Origin', async () => {
      process.env.NODE_ENV = 'production'
      process.env.ALLOWED_ORIGINS = 'https://example.com'
      
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { 
          'Authorization': 'Bearer valid-token',
          'Origin': 'https://example.com'
        }
      })
      
      const response = await middleware(request)
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true')
    })

    it('应该拒绝未授权的Origin', async () => {
      process.env.NODE_ENV = 'production'
      process.env.ALLOWED_ORIGINS = 'https://example.com'
      
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { 
          'Authorization': 'Bearer valid-token',
          'Origin': 'https://malicious.com'
        }
      })
      
      const response = await middleware(request)
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('null')
    })
  })

  describe('非API路由', () => {
    it('应该跳过非API路由', async () => {
      const request = new NextRequest('http://localhost:3000/admin/dashboard')
      const response = await middleware(request)
      
      expect(response.headers.get('X-Middleware-Debug')).toBeTruthy()
      expect(response.headers.get('X-Middleware-Path')).toBe('/admin/dashboard')
      expect(verifyAccessToken).not.toHaveBeenCalled()
    })

    it('应该处理根路径', async () => {
      const request = new NextRequest('http://localhost:3000/')
      const response = await middleware(request)
      
      expect(response.headers.get('X-Middleware-Debug')).toBeTruthy()
      expect(verifyAccessToken).not.toHaveBeenCalled()
    })
  })

  describe('非受保护API路由', () => {
    it('应该允许访问非admin API', async () => {
      // 设置开发环境以确保CORS头为*
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const request = new NextRequest('http://localhost:3000/api/health')
      const response = await middleware(request)
      
      expect(response.status).not.toBe(401)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(verifyAccessToken).not.toHaveBeenCalled()
      
      // 恢复环境变量
      process.env.NODE_ENV = originalEnv
    })

    it('应该允许访问其他API路径', async () => {
      const request = new NextRequest('http://localhost:3000/api/public/data')
      const response = await middleware(request)
      
      expect(response.status).not.toBe(401)
      expect(verifyAccessToken).not.toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应该返回正确的错误格式', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/users')
      const response = await middleware(request)
      
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toHaveProperty('code', 401)
      expect(body).toHaveProperty('message')
      expect(body).toHaveProperty('data', null)
    })

    it('应该设置正确的CORS头在错误响应中', async () => {
      // 设置开发环境以确保CORS头为*
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { 'Origin': 'http://localhost:3000' }
      })
      const response = await middleware(request)
      
      expect(response.status).toBe(401)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      
      // 恢复环境变量
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('边界情况', () => {
    it('应该处理空的Authorization头', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { 'Authorization': '' }
      })
      const response = await middleware(request)
      
      expect(response.status).toBe(401)
    })

    it('应该处理只有Bearer的Authorization头', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { 'Authorization': 'Bearer' }
      })
      const response = await middleware(request)
      
      expect(response.status).toBe(401)
    })

    it('应该处理Bearer后面有空格但没有token', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { 'Authorization': 'Bearer ' }
      })
      const response = await middleware(request)
      
      expect(response.status).toBe(401)
    })

    it('应该处理非常长的路径', async () => {
      const longPath = '/api/admin/' + 'a'.repeat(1000)
      const request = new NextRequest(`http://localhost:3000${longPath}`, {
        headers: { 'Authorization': 'Bearer valid-token' }
      })
      
      const response = await middleware(request)
      
      expect(verifyAccessToken).toHaveBeenCalled()
    })
  })
})
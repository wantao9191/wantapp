import { describe, it, expect, vi, beforeEach } from 'vitest'
import HttpRequest from '@/lib/https'

// Mock fetch
global.fetch = vi.fn()

// Mock cookies
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  }
}))

// Mock antd message
vi.mock('antd', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/test',
}))

describe('HttpRequest - 刷新Token机制测试', () => {
  let http: HttpRequest
  let mockFetch: any

  beforeEach(() => {
    vi.clearAllMocks()
    http = new HttpRequest({
      baseURL: '/api',
      timeout: 10000,
      showMessage: false,
    })
    mockFetch = vi.mocked(fetch)
  })

  describe('核心功能测试', () => {
    it('应该正确处理401错误并尝试刷新token', async () => {
      // Mock 401响应
      const expiredResponse = {
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({
          code: 401,
          message: 'Token expired',
          data: null
        }),
        clone: () => expiredResponse
      }

      // Mock 刷新token成功
      const refreshResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({
          code: 200,
          data: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token'
          }
        })
      }

      // Mock 重新发送请求成功
      const successResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({
          code: 200,
          data: { users: [] }
        })
      }

      mockFetch
        .mockResolvedValueOnce(expiredResponse)
        .mockResolvedValueOnce(refreshResponse)
        .mockResolvedValueOnce(successResponse)

      // Mock cookies
      const mockCookies = await import('js-cookie')
      mockCookies.default.get.mockReturnValue('refresh-token')

      const result = await http.get('/admin/users')

      // 验证结果
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ users: [] })

      // 验证fetch被调用了3次
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('应该区分token过期和其他401错误', async () => {
      // Mock 权限不足的401错误
      const permissionDeniedResponse = {
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({
          code: 401,
          message: 'Permission denied',
          data: null
        }),
        clone: () => permissionDeniedResponse
      }

      mockFetch.mockResolvedValueOnce(permissionDeniedResponse)

      // 权限不足应该直接抛出异常，不尝试刷新
      await expect(http.get('/admin/users')).rejects.toThrow()
      expect(mockFetch).toHaveBeenCalledTimes(1) // 只调用一次，不刷新
    })

    it('应该处理刷新token失败的情况', async () => {
      const expiredResponse = {
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({
          code: 401,
          message: 'Token expired',
          data: null
        }),
        clone: () => expiredResponse
      }

      const refreshFailResponse = {
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({
          code: 401,
          message: 'Refresh token expired'
        })
      }

      mockFetch
        .mockResolvedValueOnce(expiredResponse)
        .mockResolvedValueOnce(refreshFailResponse)

      const mockCookies = await import('js-cookie')
      mockCookies.default.get.mockReturnValue('invalid-refresh-token')

      // 应该抛出异常
      await expect(http.get('/admin/users')).rejects.toThrow()

      // 验证只调用了2次fetch（原请求 + 刷新请求）
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('应该处理没有refresh token的情况', async () => {
      const expiredResponse = {
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({
          code: 401,
          message: 'Token expired',
          data: null
        }),
        clone: () => expiredResponse
      }

      mockFetch.mockResolvedValueOnce(expiredResponse)

      const mockCookies = await import('js-cookie')
      mockCookies.default.get.mockReturnValue(null) // 没有refresh token

      await expect(http.get('/admin/users')).rejects.toThrow()
      expect(mockFetch).toHaveBeenCalledTimes(1) // 只调用原请求
    })

    it('应该正确识别token过期关键词', async () => {
      const testCases = [
        'Token expired',
        'JWT expired', 
        '登录已过期',
        'expired',
        '过期'
      ]

      for (const message of testCases) {
      vi.clearAllMocks()
        
        const response = {
          ok: false,
          status: 401,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({
            code: 401,
            message,
            data: null
          }),
          clone: () => response
        }

        mockFetch.mockResolvedValueOnce(response)

        const mockCookies = await import('js-cookie')
        mockCookies.default.get.mockReturnValue('refresh-token')

        // 应该尝试刷新token
        await expect(http.get('/admin/users')).rejects.toThrow()
        expect(mockFetch).toHaveBeenCalledTimes(2) // 原请求 + 刷新请求
      }
    })

    it('应该正确识别非token过期错误', async () => {
      const testCases = [
        'Permission denied',
        'Invalid token format',
        'Unauthorized',
        'Access forbidden'
      ]

      for (const message of testCases) {
      vi.clearAllMocks()
        
        const response = {
          ok: false,
          status: 401,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({
            code: 401,
            message,
            data: null
          }),
          clone: () => response
        }

        mockFetch.mockResolvedValueOnce(response)

        // 不应该尝试刷新token
        await expect(http.get('/admin/users')).rejects.toThrow()
        expect(mockFetch).toHaveBeenCalledTimes(1) // 只调用原请求
      }
    })
  })
})

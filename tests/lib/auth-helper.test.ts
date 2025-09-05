import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  getUserIdFromHeaders,
  getUserRolesFromHeaders,
  getUserOrganizationIdFromHeaders,
  getUserContext,
  checkPermission,
  checkAuth,
  withPermissionCheck,
  withAuth
} from '../../src/lib/auth-helper'

// Mock dependencies
vi.mock('../../src/lib/permissions', () => ({
  hasPermission: vi.fn(),
  getUserPermissions: vi.fn(),
  isSuperAdmin: vi.fn()
}))

vi.mock('../../src/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ organizationId: 1 }]))
        }))
      }))
    }))
  }
}))

describe('auth-helper', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    vi.clearAllMocks()
    mockRequest = new NextRequest('http://localhost:3000/api/test')
  })

  describe('getUserIdFromHeaders', () => {
    it('应该从请求头获取用户ID', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'X-User-Id': '123' }
      })

      const userId = getUserIdFromHeaders(request)
      expect(userId).toBe(123)
    })

    it('应该在没有用户ID头时返回null', () => {
      const userId = getUserIdFromHeaders(mockRequest)
      expect(userId).toBeNull()
    })

    it('应该在用户ID无效时返回null', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'X-User-Id': 'invalid' }
      })

      const userId = getUserIdFromHeaders(request)
      expect(userId).toBeNull()
    })
  })

  describe('getUserRolesFromHeaders', () => {
    it('应该从请求头获取用户角色', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'X-User-Roles': '[1, 2, 3]' }
      })

      const roles = getUserRolesFromHeaders(request)
      expect(roles).toEqual([1, 2, 3])
    })

    it('应该在没有角色头时返回空数组', () => {
      const roles = getUserRolesFromHeaders(mockRequest)
      expect(roles).toEqual([])
    })

    it('应该在JSON解析失败时返回空数组', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'X-User-Roles': 'invalid-json' }
      })

      const roles = getUserRolesFromHeaders(request)
      expect(roles).toEqual([])
    })
  })

  describe('getUserOrganizationIdFromHeaders', () => {
    it('应该从请求头获取机构ID', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'X-User-Organization-Id': '456' }
      })

      const orgId = getUserOrganizationIdFromHeaders(request)
      expect(orgId).toBe(456)
    })

    it('应该在没有机构ID头时返回null', () => {
      const orgId = getUserOrganizationIdFromHeaders(mockRequest)
      expect(orgId).toBeNull()
    })
  })

  describe('getUserContext', () => {
    it('应该在没有用户ID时返回null', async () => {
      const context = await getUserContext(mockRequest)
      expect(context).toBeNull()
    })

    it('应该返回完整的用户上下文', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'X-User-Id': '123',
          'X-User-Roles': '[1, 2]',
          'X-User-Organization-Id': '456'
        }
      })

      const { getUserPermissions, isSuperAdmin } = await import('../../src/lib/permissions')
      vi.mocked(getUserPermissions).mockResolvedValue(['user_read', 'user_write'])
      vi.mocked(isSuperAdmin).mockResolvedValue(false)

      const context = await getUserContext(request)

      expect(context).toEqual({
        userId: 123,
        roles: [1, 2],
        permissions: ['user_read', 'user_write'],
        isSuperAdmin: false,
        organizationId: 456
      })
    })
  })

  describe('checkPermission', () => {
    it('应该在没有用户ID时返回401响应', async () => {
      const response = await checkPermission(mockRequest, 'test_permission')
      
      expect(response).not.toBeNull()
      expect(response!.status).toBe(401)
    })

    it('应该在权限不足时返回403响应', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'X-User-Id': '123' }
      })

      const { hasPermission } = await import('../../src/lib/permissions')
      vi.mocked(hasPermission).mockResolvedValue(false)

      const response = await checkPermission(request, 'test_permission')
      
      expect(response).not.toBeNull()
      expect(response!.status).toBe(403)
    })

    it('应该在权限检查通过时返回null', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'X-User-Id': '123' }
      })

      const { hasPermission } = await import('../../src/lib/permissions')
      vi.mocked(hasPermission).mockResolvedValue(true)

      const response = await checkPermission(request, 'test_permission')
      
      expect(response).toBeNull()
    })
  })

  describe('checkAuth', () => {
    it('应该在没有用户ID时返回失败结果', async () => {
      const result = await checkAuth(mockRequest)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error!.status).toBe(401)
    })

    it('应该在有用户ID时返回成功结果', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'X-User-Id': '123' }
      })

      const result = await checkAuth(request)
      
      expect(result.success).toBe(true)
      expect(result.userId).toBe(123)
    })
  })

  describe('withPermissionCheck', () => {
    it('应该创建权限检查装饰器', async () => {
      const mockHandler = vi.fn().mockResolvedValue('success')
      const decoratedHandler = withPermissionCheck('test_permission')(mockHandler)

      // 测试无权限情况
      const response = await decoratedHandler(mockRequest)
      expect(response).toBeDefined()
      expect(mockHandler).not.toHaveBeenCalled()
    })
  })

  describe('withAuth', () => {
    it('应该创建认证检查装饰器', async () => {
      const mockHandler = vi.fn().mockResolvedValue('success')
      const decoratedHandler = withAuth()(mockHandler)

      // 测试未认证情况
      const response = await decoratedHandler(mockRequest)
      expect(response).toBeDefined()
      expect(mockHandler).not.toHaveBeenCalled()
    })
  })
})
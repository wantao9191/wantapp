import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  getUserContextFromJWT,
  getUserContext,
  checkPermissionFromJWT,
  checkPermission,
  checkAuth,
  withPermissionCheck,
  withAuth,
  checkMultiplePermissions,
  applyOrganizationFilter,
  checkOrganizationAccess
} from '../../src/lib/auth-helper'

// Mock JWT functions
vi.mock('../../src/lib/jwt', () => ({
  verifyAccessToken: vi.fn()
}))

import { verifyAccessToken } from '../../src/lib/jwt'

describe('auth-helper - Enhanced Tests', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    vi.clearAllMocks()
    mockRequest = new NextRequest('http://localhost:3000/api/test')
  })

  describe('getUserContextFromJWT', () => {
    it('应该从JWT获取用户上下文', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 123,
        roles: [1, 2],
        permissions: [1, 2, 3],
        organizationId: 456,
        isSuperAdmin: false
      })

      const result = await getUserContextFromJWT(request)

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        userId: 123,
        roles: [1, 2],
        permissions: [1, 2, 3],
        organizationId: 456,
        isSuperAdmin: false
      })
    })

    it('应该在没有Authorization头时返回错误', async () => {
      const result = await getUserContextFromJWT(mockRequest)

      expect(result.success).toBe(false)
      expect(result.error).toBe('unauthorized')
    })

    it('应该在Authorization头格式错误时返回错误', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Basic invalid' }
      })

      const result = await getUserContextFromJWT(request)

      expect(result.success).toBe(false)
      expect(result.error).toBe('unauthorized')
    })

    it('应该在JWT验证失败时返回错误', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer invalid-token' }
      })

      vi.mocked(verifyAccessToken).mockRejectedValue(new Error('Invalid token'))

      const result = await getUserContextFromJWT(request)

      expect(result.success).toBe(false)
      expect(result.error).toBe('unauthorized')
    })

    it('应该处理超级管理员', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer super-admin-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 1,
        roles: [1],
        permissions: [],
        organizationId: null,
        isSuperAdmin: true
      })

      const result = await getUserContextFromJWT(request)

      expect(result.success).toBe(true)
      expect(result.data?.isSuperAdmin).toBe(true)
      expect(result.data?.organizationId).toBeNull()
    })

    it('应该处理没有权限的用户', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer limited-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 123,
        roles: [1],
        permissions: undefined,
        organizationId: 456,
        isSuperAdmin: false
      })

      const result = await getUserContextFromJWT(request)

      expect(result.success).toBe(true)
      expect(result.data?.permissions).toEqual([])
    })
  })

  describe('getUserContext', () => {
    it('应该返回用户上下文', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 123,
        roles: [1, 2],
        permissions: [1, 2, 3],
        organizationId: 456,
        isSuperAdmin: false
      })

      const result = await getUserContext(request)

      expect(result).toEqual({
        userId: 123,
        roles: [1, 2],
        permissions: [1, 2, 3],
        organizationId: 456,
        isSuperAdmin: false
      })
    })

    it('应该在失败时返回null', async () => {
      const result = await getUserContext(mockRequest)
      expect(result).toBeNull()
    })
  })

  describe('checkPermissionFromJWT', () => {
    it('应该允许超级管理员访问', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer super-admin-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 1,
        roles: [1],
        permissions: [],
        organizationId: null,
        isSuperAdmin: true
      })

      const result = await checkPermissionFromJWT(request, 'admin:write')

      expect(result).toBeNull()
    })

    it('应该允许有通配符权限的用户访问', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer wildcard-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 123,
        roles: [1],
        permissions: ['*'], // 通配符权限
        organizationId: 456,
        isSuperAdmin: false
      })

      const result = await checkPermissionFromJWT(request, 'admin:write')

      expect(result).toBeNull()
    })

    it('应该允许有特定权限的用户访问', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer user-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 123,
        roles: [1],
        permissions: ['user:read', 'user:write'],
        organizationId: 456,
        isSuperAdmin: false
      })

      const result = await checkPermissionFromJWT(request, 'user:read')

      expect(result).toBeNull()
    })

    it('应该拒绝没有权限的用户', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer limited-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 123,
        roles: [1],
        permissions: ['user:read'],
        organizationId: 456,
        isSuperAdmin: false
      })

      const result = await checkPermissionFromJWT(request, 'admin:write')

      expect(result).not.toBeNull()
      expect(result?.status).toBe(403)
    })

    it('应该在未认证时返回401', async () => {
      const result = await checkPermissionFromJWT(mockRequest, 'user:read')

      expect(result).not.toBeNull()
      expect(result?.status).toBe(401)
    })
  })

  describe('checkAuth', () => {
    it('应该在认证成功时返回用户ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 123,
        roles: [1],
        permissions: [1],
        organizationId: 456,
        isSuperAdmin: false
      })

      const result = await checkAuth(request)

      expect(result.success).toBe(true)
      expect(result.userId).toBe(123)
    })

    it('应该在未认证时返回错误', async () => {
      const result = await checkAuth(mockRequest)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('withPermissionCheck', () => {
    it('应该创建权限检查装饰器', async () => {
      const mockHandler = vi.fn().mockResolvedValue('success')
      const decoratedHandler = withPermissionCheck('admin:read')(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer admin-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 1,
        roles: [1],
        permissions: ['admin:read'],
        organizationId: null,
        isSuperAdmin: false
      })

      const result = await decoratedHandler(request)

      expect(result).toBe('success')
      expect(mockHandler).toHaveBeenCalledWith(request, {
        userId: 1,
        roles: [1],
        permissions: ['admin:read'],
        isSuperAdmin: false,
        organizationId: null
      })
    })

    it('应该拒绝没有权限的请求', async () => {
      const mockHandler = vi.fn()
      const decoratedHandler = withPermissionCheck('admin:write')(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer user-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 123,
        roles: [1],
        permissions: ['user:read'],
        organizationId: 456,
        isSuperAdmin: false
      })

      const result = await decoratedHandler(request)

      expect(mockHandler).not.toHaveBeenCalled()
      expect(result).toBeInstanceOf(Response)
    })
  })

  describe('withAuth', () => {
    it('应该创建认证检查装饰器', async () => {
      const mockHandler = vi.fn().mockResolvedValue('authenticated')
      const decoratedHandler = withAuth()(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 123,
        roles: [1],
        permissions: [1],
        organizationId: 456,
        isSuperAdmin: false
      })

      const result = await decoratedHandler(request)

      expect(result).toBe('authenticated')
      expect(mockHandler).toHaveBeenCalled()
    })

    it('应该拒绝未认证的请求', async () => {
      const mockHandler = vi.fn()
      const decoratedHandler = withAuth()(mockHandler)

      const result = await decoratedHandler(mockRequest)

      expect(mockHandler).not.toHaveBeenCalled()
      expect(result).toBeInstanceOf(Response)
    })
  })

  describe('checkMultiplePermissions', () => {
    it('应该检查多个权限（需要全部）', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer multi-perm-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 123,
        roles: [1],
        permissions: ['user:read', 'user:write', 'admin:read'],
        organizationId: 456,
        isSuperAdmin: false
      })

      const result = await checkMultiplePermissions(request, ['user:read', 'user:write'], true)

      expect(result).toBeNull()
    })

    it('应该检查多个权限（需要任一）', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer partial-perm-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 123,
        roles: [1],
        permissions: ['user:read'],
        organizationId: 456,
        isSuperAdmin: false
      })

      const result = await checkMultiplePermissions(request, ['user:read', 'admin:write'], false)

      expect(result).toBeNull()
    })

    it('应该拒绝权限不足的请求（需要全部）', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer limited-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 123,
        roles: [1],
        permissions: ['user:read'],
        organizationId: 456,
        isSuperAdmin: false
      })

      const result = await checkMultiplePermissions(request, ['user:read', 'admin:write'], true)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(403)
    })

    it('应该拒绝权限不足的请求（需要任一）', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer no-perm-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 123,
        roles: [1],
        permissions: ['other:read'],
        organizationId: 456,
        isSuperAdmin: false
      })

      const result = await checkMultiplePermissions(request, ['user:read', 'admin:write'], false)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(403)
    })
  })

  describe('applyOrganizationFilter', () => {
    it('应该不过滤超级管理员的数据', () => {
      const context = { organizationId: 1, isSuperAdmin: true }
      const data = [
        { id: 1, organizationId: 1 },
        { id: 2, organizationId: 2 },
        { id: 3, organizationId: 3 }
      ]

      const result = applyOrganizationFilter(context, data)

      expect(result).toEqual(data)
    })

    it('应该过滤普通用户的数据', () => {
      const context = { organizationId: 1, isSuperAdmin: false }
      const data = [
        { id: 1, organizationId: 1 },
        { id: 2, organizationId: 2 },
        { id: 3, organizationId: 1 }
      ]

      const result = applyOrganizationFilter(context, data)

      expect(result).toEqual([
        { id: 1, organizationId: 1 },
        { id: 3, organizationId: 1 }
      ])
    })

    it('应该处理单个对象', () => {
      const context = { organizationId: 1, isSuperAdmin: false }
      const data = { id: 1, organizationId: 1 }

      const result = applyOrganizationFilter(context, data)

      expect(result).toEqual(data)
    })

    it('应该拒绝不属于用户机构的单个对象', () => {
      const context = { organizationId: 1, isSuperAdmin: false }
      const data = { id: 1, organizationId: 2 }

      const result = applyOrganizationFilter(context, data)

      expect(result).toBeNull()
    })

    it('应该在没有机构ID时返回空数据', () => {
      const context = { organizationId: undefined, isSuperAdmin: false }
      const data = [{ id: 1, organizationId: 1 }]

      const result = applyOrganizationFilter(context, data)

      expect(result).toEqual([])
    })

    it('应该使用自定义机构ID字段', () => {
      const context = { organizationId: 1, isSuperAdmin: false }
      const data = [
        { id: 1, companyId: 1 },
        { id: 2, companyId: 2 }
      ]

      const result = applyOrganizationFilter(context, data, 'companyId')

      expect(result).toEqual([{ id: 1, companyId: 1 }])
    })
  })

  describe('checkOrganizationAccess', () => {
    it('应该允许超级管理员访问所有数据', () => {
      const context = { organizationId: 1, isSuperAdmin: true }
      const result = checkOrganizationAccess(context, 2)

      expect(result).toBe(true)
    })

    it('应该允许用户访问自己机构的数据', () => {
      const context = { organizationId: 1, isSuperAdmin: false }
      const result = checkOrganizationAccess(context, 1)

      expect(result).toBe(true)
    })

    it('应该拒绝用户访问其他机构的数据', () => {
      const context = { organizationId: 1, isSuperAdmin: false }
      const result = checkOrganizationAccess(context, 2)

      expect(result).toBe(false)
    })

    it('应该在用户没有机构ID时拒绝访问', () => {
      const context = { organizationId: undefined, isSuperAdmin: false }
      const result = checkOrganizationAccess(context, 1)

      expect(result).toBe(false)
    })

    it('应该在没有上下文时允许访问', () => {
      const result = checkOrganizationAccess(undefined, 1)

      expect(result).toBe(true)
    })

    it('应该处理undefined目标机构ID', () => {
      const context = { organizationId: 1, isSuperAdmin: false }
      const result = checkOrganizationAccess(context, undefined)

      expect(result).toBe(false)
    })
  })

  describe('边界情况', () => {
    it('应该处理空的Authorization头', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': '' }
      })

      const result = await getUserContextFromJWT(request)

      expect(result.success).toBe(false)
      expect(result.error).toBe('unauthorized')
    })

    it('应该处理只有Bearer的Authorization头', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer' }
      })

      const result = await getUserContextFromJWT(request)

      expect(result.success).toBe(false)
      expect(result.error).toBe('unauthorized')
    })

    it('应该处理Bearer后面有空格但没有token', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer ' }
      })

      const result = await getUserContextFromJWT(request)

      expect(result.success).toBe(false)
      expect(result.error).toBe('unauthorized')
    })

    it('应该处理非常长的token', async () => {
      const longToken = 'a'.repeat(1000)
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': `Bearer ${longToken}` }
      })

      vi.mocked(verifyAccessToken).mockRejectedValue(new Error('Invalid token'))

      const result = await getUserContextFromJWT(request)

      expect(result.success).toBe(false)
      expect(verifyAccessToken).toHaveBeenCalledWith(longToken)
    })

    it('应该处理空的权限数组', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer empty-perms-token' }
      })

      vi.mocked(verifyAccessToken).mockResolvedValue({
        id: 123,
        roles: [],
        permissions: [],
        organizationId: 456,
        isSuperAdmin: false
      })

      const result = await checkPermissionFromJWT(request, 'user:read')

      expect(result).not.toBeNull()
      expect(result?.status).toBe(403)
    })
  })
})
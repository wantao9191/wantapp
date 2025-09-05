import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { PUT } from '../../src/app/api/admin/roles/[id]/route'

// Mock dependencies
vi.mock('../../src/lib/validations', () => ({
  roleSchema: {
    safeParse: vi.fn()
  }
}))

vi.mock('../../src/db', () => ({
  db: {
    update: vi.fn()
  }
}))

vi.mock('../../src/db/schema', () => ({
  roles: {
    id: 'id'
  }
}))

vi.mock('../../src/app/api/_utils/handler', () => ({
  createHandler: vi.fn((handler, options) => handler)
}))

describe('Admin Roles [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PUT /api/admin/roles/[id]', () => {
    it('应该成功更新角色信息', async () => {
      const { roleSchema } = await import('../../src/lib/validations')
      const { db } = await import('../../src/db')
      
      const mockRoleData = {
        name: '管理员',
        description: '系统管理员角色',
        status: 1,
        permissions: [1, 2, 3],
        menus: [1, 2, 3]
      }

      vi.mocked(roleSchema.safeParse).mockReturnValue({
        success: true,
        data: mockRoleData
      } as any)

      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1, ...mockRoleData }]))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/roles/1', {
        method: 'PUT',
        body: JSON.stringify(mockRoleData)
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      const response = await PUT(request, { id: '1' }, context)

      expect(roleSchema.safeParse).toHaveBeenCalledWith(mockRoleData)
      expect(db.update).toHaveBeenCalled()
      expect(updateMock.set).toHaveBeenCalledWith(mockRoleData)
      expect(response).toEqual([{ id: 1, ...mockRoleData }])
    })

    it('应该拒绝无效的角色数据', async () => {
      const { roleSchema } = await import('../../src/lib/validations')
      
      vi.mocked(roleSchema.safeParse).mockReturnValue({
        success: false,
        error: {
          errors: [{ message: '角色名称不能为空' }]
        }
      } as any)

      const request = new NextRequest('http://localhost:3000/api/admin/roles/1', {
        method: 'PUT',
        body: JSON.stringify({ name: '' })
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await expect(PUT(request, { id: '1' }, context)).rejects.toThrow('角色名称不能为空')
    })

    it('应该处理数据验证错误', async () => {
      const { roleSchema } = await import('../../src/lib/validations')
      
      vi.mocked(roleSchema.safeParse).mockReturnValue({
        success: false,
        error: {
          errors: [
            { message: '角色名称至少2个字符' },
            { message: '状态值无效' }
          ]
        }
      } as any)

      const request = new NextRequest('http://localhost:3000/api/admin/roles/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'a', status: 999 })
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await expect(PUT(request, { id: '1' }, context)).rejects.toThrow('角色名称至少2个字符')
    })

    it('应该处理数据库更新错误', async () => {
      const { roleSchema } = await import('../../src/lib/validations')
      const { db } = await import('../../src/db')
      
      vi.mocked(roleSchema.safeParse).mockReturnValue({
        success: true,
        data: { name: '测试角色' }
      } as any)

      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.reject(new Error('Database error')))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/roles/1', {
        method: 'PUT',
        body: JSON.stringify({ name: '测试角色' })
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await expect(PUT(request, { id: '1' }, context)).rejects.toThrow('Database error')
    })

    it('应该正确解析角色ID参数', async () => {
      const { roleSchema } = await import('../../src/lib/validations')
      const { db } = await import('../../src/db')
      const { roles } = await import('../../src/db/schema')
      
      vi.mocked(roleSchema.safeParse).mockReturnValue({
        success: true,
        data: { name: '测试角色' }
      } as any)

      const returningMock = vi.fn(() => Promise.resolve([{ id: 123 }]))
      const whereMock = vi.fn(() => ({ returning: returningMock }))
      const setMock = vi.fn(() => ({ where: whereMock }))
      const updateMock = vi.fn(() => ({ set: setMock }))
      
      vi.mocked(db.update).mockImplementation(updateMock)

      const request = new NextRequest('http://localhost:3000/api/admin/roles/123', {
        method: 'PUT',
        body: JSON.stringify({ name: '测试角色' })
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await PUT(request, { id: '123' }, context)

      expect(updateMock).toHaveBeenCalledWith(roles)
      expect(setMock).toHaveBeenCalledWith({ name: '测试角色' })
    })

    it('应该处理无效的角色ID', async () => {
      const { roleSchema } = await import('../../src/lib/validations')
      const { db } = await import('../../src/db')
      
      vi.mocked(roleSchema.safeParse).mockReturnValue({
        success: true,
        data: { name: '测试角色' }
      } as any)

      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([]))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/roles/999', {
        method: 'PUT',
        body: JSON.stringify({ name: '测试角色' })
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      const response = await PUT(request, { id: '999' }, context)

      expect(response).toEqual([])
    })

    it('应该处理JSON解析错误', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/roles/1', {
        method: 'PUT',
        body: 'invalid json'
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await expect(PUT(request, { id: '1' }, context)).rejects.toThrow()
    })

    it('应该支持部分更新', async () => {
      const { roleSchema } = await import('../../src/lib/validations')
      const { db } = await import('../../src/db')
      
      const partialData = {
        name: '新角色名称'
        // 只更新名称，其他字段保持不变
      }

      vi.mocked(roleSchema.safeParse).mockReturnValue({
        success: true,
        data: partialData
      } as any)

      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1, ...partialData }]))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/roles/1', {
        method: 'PUT',
        body: JSON.stringify(partialData)
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      const response = await PUT(request, { id: '1' }, context)

      expect(updateMock.set).toHaveBeenCalledWith(partialData)
      expect(response).toEqual([{ id: 1, ...partialData }])
    })
  })
})
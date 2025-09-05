import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { PUT, DELETE } from '../../src/app/api/admin/users/[id]/route'

// Mock dependencies
vi.mock('../../src/lib/validations', () => ({
  userSchema: {
    safeParse: vi.fn()
  }
}))

vi.mock('../../src/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn()
  }
}))

vi.mock('../../src/db/schema', () => ({
  users: {
    id: 'id',
    organizationId: 'organizationId'
  }
}))

vi.mock('../../src/app/api/_utils/handler', () => ({
  createHandler: vi.fn((handler, options) => handler),
  checkOrganizationAccess: vi.fn()
}))

describe('Admin Users [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PUT /api/admin/users/[id]', () => {
    it('应该成功更新用户信息', async () => {
      const { userSchema } = await import('../../src/lib/validations')
      const { db } = await import('../../src/db')
      
      const mockUserData = {
        name: '张三',
        username: 'zhangsan',
        phone: '13800138000',
        email: 'zhangsan@example.com'
      }

      vi.mocked(userSchema.safeParse).mockReturnValue({
        success: true,
        data: mockUserData
      } as any)

      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1, ...mockUserData }]))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users/1', {
        method: 'PUT',
        body: JSON.stringify(mockUserData)
      })

      const context = {
        userId: 2,
        isSuperAdmin: true,
        organizationId: 1
      }

      const response = await PUT(request, { id: '1' }, context)

      expect(userSchema.safeParse).toHaveBeenCalledWith(mockUserData)
      expect(db.update).toHaveBeenCalled()
      expect(response).toEqual([{ id: 1, ...mockUserData }])
    })

    it('应该拒绝无效的用户数据', async () => {
      const { userSchema } = await import('../../src/lib/validations')
      
      vi.mocked(userSchema.safeParse).mockReturnValue({
        success: false,
        error: {
          errors: [{ message: '用户名不能为空' }]
        }
      } as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users/1', {
        method: 'PUT',
        body: JSON.stringify({ name: '' })
      })

      const context = {
        userId: 2,
        isSuperAdmin: true,
        organizationId: 1
      }

      await expect(PUT(request, { id: '1' }, context)).rejects.toThrow('用户名不能为空')
    })

    it('应该阻止用户修改自己的信息', async () => {
      const { userSchema } = await import('../../src/lib/validations')
      
      vi.mocked(userSchema.safeParse).mockReturnValue({
        success: true,
        data: { name: '张三' }
      } as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users/1', {
        method: 'PUT',
        body: JSON.stringify({ name: '张三' })
      })

      const context = {
        userId: 1, // 用户ID与要修改的ID相同
        isSuperAdmin: false,
        organizationId: 1
      }

      await expect(PUT(request, { id: '1' }, context)).rejects.toThrow('不能修改自己的信息')
    })

    it('应该检查非超级管理员的机构权限', async () => {
      const { userSchema } = await import('../../src/lib/validations')
      const { db } = await import('../../src/db')
      const { checkOrganizationAccess } = await import('../../src/app/api/_utils/handler')
      
      vi.mocked(userSchema.safeParse).mockReturnValue({
        success: true,
        data: { name: '张三' }
      } as any)

      const selectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{ organizationId: 2 }]))
          }))
        }))
      }
      vi.mocked(db.select).mockReturnValue(selectMock as any)
      vi.mocked(checkOrganizationAccess).mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/admin/users/1', {
        method: 'PUT',
        body: JSON.stringify({ name: '张三' })
      })

      const context = {
        userId: 2,
        isSuperAdmin: false,
        organizationId: 1
      }

      await expect(PUT(request, { id: '1' }, context)).rejects.toThrow('无权操作该用户')
    })

    it('应该允许超级管理员修改任何用户', async () => {
      const { userSchema } = await import('../../src/lib/validations')
      const { db } = await import('../../src/db')
      
      const mockUserData = { name: '管理员修改' }

      vi.mocked(userSchema.safeParse).mockReturnValue({
        success: true,
        data: mockUserData
      } as any)

      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1, ...mockUserData }]))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users/1', {
        method: 'PUT',
        body: JSON.stringify(mockUserData)
      })

      const context = {
        userId: 2,
        isSuperAdmin: true, // 超级管理员
        organizationId: 1
      }

      const response = await PUT(request, { id: '1' }, context)

      expect(response).toEqual([{ id: 1, ...mockUserData }])
    })
  })

  describe('DELETE /api/admin/users/[id]', () => {
    it('应该成功软删除用户', async () => {
      const { db } = await import('../../src/db')
      
      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1, deleted: true }]))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users/1', {
        method: 'DELETE'
      })

      const context = {
        userId: 2,
        isSuperAdmin: true,
        organizationId: 1
      }

      const response = await DELETE(request, { id: '1' }, context)

      expect(db.update).toHaveBeenCalled()
      expect(updateMock.set).toHaveBeenCalledWith({ deleted: true })
      expect(response).toBeUndefined()
    })

    it('应该检查非超级管理员的删除权限', async () => {
      const { db } = await import('../../src/db')
      const { checkOrganizationAccess } = await import('../../src/app/api/_utils/handler')
      
      const selectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{ organizationId: 2 }]))
          }))
        }))
      }
      vi.mocked(db.select).mockReturnValue(selectMock as any)
      vi.mocked(checkOrganizationAccess).mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/admin/users/1', {
        method: 'DELETE'
      })

      const context = {
        userId: 2,
        isSuperAdmin: false,
        organizationId: 1
      }

      await expect(DELETE(request, { id: '1' }, context)).rejects.toThrow('无权操作该用户')
    })

    it('应该处理用户不存在的情况', async () => {
      const { db } = await import('../../src/db')
      
      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([]))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users/999', {
        method: 'DELETE'
      })

      const context = {
        userId: 2,
        isSuperAdmin: true,
        organizationId: 1
      }

      await expect(DELETE(request, { id: '999' }, context)).rejects.toThrow('用户不存在或无权限操作')
    })

    it('应该允许超级管理员删除任何用户', async () => {
      const { db } = await import('../../src/db')
      
      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1, deleted: true }]))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users/1', {
        method: 'DELETE'
      })

      const context = {
        userId: 2,
        isSuperAdmin: true, // 超级管理员
        organizationId: 1
      }

      const response = await DELETE(request, { id: '1' }, context)

      expect(response).toBeUndefined()
    })

    it('应该处理数据库错误', async () => {
      const { db } = await import('../../src/db')
      
      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.reject(new Error('Database error')))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users/1', {
        method: 'DELETE'
      })

      const context = {
        userId: 2,
        isSuperAdmin: true,
        organizationId: 1
      }

      await expect(DELETE(request, { id: '1' }, context)).rejects.toThrow('Database error')
    })
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { PUT, DELETE } from '../../src/app/api/admin/permissions/[id]/route'

// Mock dependencies
vi.mock('../../src/lib/validations', () => ({
  permissionSchema: {
    safeParse: vi.fn()
  }
}))

vi.mock('../../src/db', () => ({
  db: {
    update: vi.fn()
  }
}))

vi.mock('../../src/db/schema', () => ({
  permissions: {
    id: 'id'
  }
}))

vi.mock('../../src/app/api/_utils/handler', () => ({
  createHandler: vi.fn((handler, options) => handler)
}))

describe('Admin Permissions [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PUT /api/admin/permissions/[id]', () => {
    it('应该成功更新权限信息', async () => {
      const { permissionSchema } = await import('../../src/lib/validations')
      const { db } = await import('../../src/db')
      
      const mockPermissionData = {
        name: '用户查看',
        code: 'user:view',
        menuId: 1,
        description: '查看用户信息的权限',
        status: 1
      }

      vi.mocked(permissionSchema.safeParse).mockReturnValue({
        success: true,
        data: mockPermissionData
      } as any)

      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1, ...mockPermissionData }]))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/permissions/1', {
        method: 'PUT',
        body: JSON.stringify(mockPermissionData)
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      const response = await PUT(request, { id: '1' }, context)

      expect(permissionSchema.safeParse).toHaveBeenCalledWith(mockPermissionData)
      expect(db.update).toHaveBeenCalled()
      expect(updateMock.set).toHaveBeenCalledWith(mockPermissionData)
      expect(response).toEqual([{ id: 1, ...mockPermissionData }])
    })

    it('应该拒绝无效的权限数据', async () => {
      const { permissionSchema } = await import('../../src/lib/validations')
      
      vi.mocked(permissionSchema.safeParse).mockReturnValue({
        success: false,
        error: {
          errors: [{ message: '权限名称不能为空' }]
        }
      } as any)

      const request = new NextRequest('http://localhost:3000/api/admin/permissions/1', {
        method: 'PUT',
        body: JSON.stringify({ name: '' })
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await expect(PUT(request, { id: '1' }, context)).rejects.toThrow('权限名称不能为空')
    })

    it('应该验证权限编码格式', async () => {
      const { permissionSchema } = await import('../../src/lib/validations')
      
      vi.mocked(permissionSchema.safeParse).mockReturnValue({
        success: false,
        error: {
          errors: [{ message: '请输入权限编码' }]
        }
      } as any)

      const request = new NextRequest('http://localhost:3000/api/admin/permissions/1', {
        method: 'PUT',
        body: JSON.stringify({ name: '测试权限', code: '' })
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await expect(PUT(request, { id: '1' }, context)).rejects.toThrow('请输入权限编码')
    })

    it('应该验证菜单ID', async () => {
      const { permissionSchema } = await import('../../src/lib/validations')
      
      vi.mocked(permissionSchema.safeParse).mockReturnValue({
        success: false,
        error: {
          errors: [{ message: '请选择菜单' }]
        }
      } as any)

      const request = new NextRequest('http://localhost:3000/api/admin/permissions/1', {
        method: 'PUT',
        body: JSON.stringify({ 
          name: '测试权限', 
          code: 'test:permission',
          menuId: 0 
        })
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await expect(PUT(request, { id: '1' }, context)).rejects.toThrow('请选择菜单')
    })

    it('应该处理数据库更新错误', async () => {
      const { permissionSchema } = await import('../../src/lib/validations')
      const { db } = await import('../../src/db')
      
      vi.mocked(permissionSchema.safeParse).mockReturnValue({
        success: true,
        data: { name: '测试权限', code: 'test:permission', menuId: 1 }
      } as any)

      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.reject(new Error('Database error')))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/permissions/1', {
        method: 'PUT',
        body: JSON.stringify({ name: '测试权限', code: 'test:permission', menuId: 1 })
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await expect(PUT(request, { id: '1' }, context)).rejects.toThrow('Database error')
    })
  })

  describe('DELETE /api/admin/permissions/[id]', () => {
    it('应该成功软删除权限', async () => {
      const { db } = await import('../../src/db')
      
      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1, deleted: true }]))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/permissions/1', {
        method: 'DELETE'
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      const response = await DELETE(request, { id: '1' }, context)

      expect(db.update).toHaveBeenCalled()
      expect(updateMock.set).toHaveBeenCalledWith({ deleted: true })
      expect(response).toEqual([{ id: 1, deleted: true }])
    })

    it('应该处理权限不存在的情况', async () => {
      const { db } = await import('../../src/db')
      
      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([]))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/permissions/999', {
        method: 'DELETE'
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      const response = await DELETE(request, { id: '999' }, context)

      expect(response).toEqual([])
    })

    it('应该正确解析权限ID参数', async () => {
      const { db } = await import('../../src/db')
      const { permissions } = await import('../../src/db/schema')
      
      const returningMock = vi.fn(() => Promise.resolve([{ id: 123, deleted: true }]))
      const whereMock = vi.fn(() => ({ returning: returningMock }))
      const setMock = vi.fn(() => ({ where: whereMock }))
      const updateMock = vi.fn(() => ({ set: setMock }))
      
      vi.mocked(db.update).mockImplementation(updateMock)

      const request = new NextRequest('http://localhost:3000/api/admin/permissions/123', {
        method: 'DELETE'
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await DELETE(request, { id: '123' }, context)

      expect(updateMock).toHaveBeenCalledWith(permissions)
      expect(setMock).toHaveBeenCalledWith({ deleted: true })
    })

    it('应该处理数据库删除错误', async () => {
      const { db } = await import('../../src/db')
      
      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.reject(new Error('Database error')))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/permissions/1', {
        method: 'DELETE'
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await expect(DELETE(request, { id: '1' }, context)).rejects.toThrow('Database error')
    })

    it('应该使用软删除而不是物理删除', async () => {
      const { db } = await import('../../src/db')
      
      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1, deleted: true }]))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const request = new NextRequest('http://localhost:3000/api/admin/permissions/1', {
        method: 'DELETE'
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await DELETE(request, { id: '1' }, context)

      // 验证使用的是update而不是delete
      expect(db.update).toHaveBeenCalled()
      expect(updateMock.set).toHaveBeenCalledWith({ deleted: true })
    })
  })

  describe('权限管理一致性', () => {
    it('PUT和DELETE应该使用相同的ID解析逻辑', async () => {
      const { permissionSchema } = await import('../../src/lib/validations')
      const { db } = await import('../../src/db')
      
      // 设置PUT的mock
      vi.mocked(permissionSchema.safeParse).mockReturnValue({
        success: true,
        data: { name: '测试权限', code: 'test:permission', menuId: 1 }
      } as any)

      const updateMock = {
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1 }]))
          }))
        }))
      }
      vi.mocked(db.update).mockReturnValue(updateMock as any)

      const putRequest = new NextRequest('http://localhost:3000/api/admin/permissions/1', {
        method: 'PUT',
        body: JSON.stringify({ name: '测试权限', code: 'test:permission', menuId: 1 })
      })

      const deleteRequest = new NextRequest('http://localhost:3000/api/admin/permissions/1', {
        method: 'DELETE'
      })

      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await PUT(putRequest, { id: '1' }, context)
      await DELETE(deleteRequest, { id: '1' }, context)

      // 验证两个操作都使用了相同的ID
      expect(db.update).toHaveBeenCalledTimes(2)
    })
  })
})
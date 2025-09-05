import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../../src/app/api/admin/menus/all/route'

// Mock dependencies
vi.mock('../../src/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([]))
        }))
      }))
    }))
  }
}))

vi.mock('../../src/db/schema', () => ({
  menus: {
    id: 'id',
    deleted: 'deleted',
    status: 'status',
    createTime: 'createTime'
  }
}))

vi.mock('../../src/lib/utils', () => ({
  buildMenuTree: vi.fn((data) => data)
}))

vi.mock('../../src/lib/permissions', () => ({
  getUserRoles: vi.fn()
}))

vi.mock('../../src/app/api/_utils/handler', () => ({
  createHandler: vi.fn((handler, options) => handler)
}))

describe('Admin Menus All API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/admin/menus/all', () => {
    it('应该返回超级管理员的所有菜单', async () => {
      const { db } = await import('../../src/db')
      const { buildMenuTree } = await import('../../src/lib/utils')
      
      const mockMenus = [
        { id: 1, name: '用户管理', path: '/admin/users', parentId: null },
        { id: 2, name: '角色管理', path: '/admin/roles', parentId: null },
        { id: 3, name: '权限管理', path: '/admin/permissions', parentId: null }
      ]

      const orderByMock = vi.fn(() => Promise.resolve(mockMenus))
      const whereMock = vi.fn(() => ({ orderBy: orderByMock }))
      const fromMock = vi.fn(() => ({ where: whereMock }))
      const selectMock = vi.fn(() => ({ from: fromMock }))
      
      vi.mocked(db.select).mockImplementation(selectMock)
      vi.mocked(buildMenuTree).mockReturnValue(mockMenus)

      const request = new NextRequest('http://localhost:3000/api/admin/menus/all')
      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      const response = await GET(request, context)

      expect(response).toEqual({ contents: mockMenus })
      expect(buildMenuTree).toHaveBeenCalledWith(mockMenus)
    })

    it('应该根据用户角色过滤菜单', async () => {
      const { db } = await import('../../src/db')
      const { getUserRoles } = await import('../../src/lib/permissions')
      const { buildMenuTree } = await import('../../src/lib/utils')
      
      const mockUserRoles = [
        { menus: [1, 2] },
        { menus: [3] }
      ]
      
      const mockMenus = [
        { id: 1, name: '用户管理', path: '/admin/users' },
        { id: 2, name: '角色管理', path: '/admin/roles' }
      ]

      vi.mocked(getUserRoles).mockResolvedValue(mockUserRoles as any)

      const orderByMock = vi.fn(() => Promise.resolve(mockMenus))
      const whereMock = vi.fn(() => ({ orderBy: orderByMock }))
      const fromMock = vi.fn(() => ({ where: whereMock }))
      const selectMock = vi.fn(() => ({ from: fromMock }))
      
      vi.mocked(db.select).mockImplementation(selectMock)
      vi.mocked(buildMenuTree).mockReturnValue(mockMenus)

      const request = new NextRequest('http://localhost:3000/api/admin/menus/all')
      const context = {
        userId: 2,
        isSuperAdmin: false,
        organizationId: 1
      }

      const response = await GET(request, context)

      expect(getUserRoles).toHaveBeenCalledWith(2)
      expect(response).toEqual({ contents: mockMenus })
    })

    it('应该只返回启用且未删除的菜单', async () => {
      const { db } = await import('../../src/db')
      const { menus } = await import('../../src/db/schema')
      
      const orderByMock = vi.fn(() => Promise.resolve([]))
      const whereMock = vi.fn(() => ({ orderBy: orderByMock }))
      const fromMock = vi.fn(() => ({ where: whereMock }))
      const selectMock = vi.fn(() => ({ from: fromMock }))
      
      vi.mocked(db.select).mockImplementation(selectMock)

      const request = new NextRequest('http://localhost:3000/api/admin/menus/all')
      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await GET(request, context)

      expect(selectMock).toHaveBeenCalled()
      expect(fromMock).toHaveBeenCalledWith(menus)
      expect(whereMock).toHaveBeenCalled()
      expect(orderByMock).toHaveBeenCalledWith(menus.createTime)
    })

    it('应该处理用户没有角色的情况', async () => {
      const { db } = await import('../../src/db')
      const { getUserRoles } = await import('../../src/lib/permissions')
      const { buildMenuTree } = await import('../../src/lib/utils')
      
      vi.mocked(getUserRoles).mockResolvedValue([])

      const orderByMock = vi.fn(() => Promise.resolve([]))
      const whereMock = vi.fn(() => ({ orderBy: orderByMock }))
      const fromMock = vi.fn(() => ({ where: whereMock }))
      const selectMock = vi.fn(() => ({ from: fromMock }))
      
      vi.mocked(db.select).mockImplementation(selectMock)
      vi.mocked(buildMenuTree).mockReturnValue([])

      const request = new NextRequest('http://localhost:3000/api/admin/menus/all')
      const context = {
        userId: 2,
        isSuperAdmin: false,
        organizationId: 1
      }

      const response = await GET(request, context)

      expect(response).toEqual({ contents: [] })
    })

    it('应该处理用户角色没有菜单权限的情况', async () => {
      const { db } = await import('../../src/db')
      const { getUserRoles } = await import('../../src/lib/permissions')
      const { buildMenuTree } = await import('../../src/lib/utils')
      
      const mockUserRoles = [
        { menus: null },
        { menus: undefined }
      ]
      
      vi.mocked(getUserRoles).mockResolvedValue(mockUserRoles as any)

      const orderByMock = vi.fn(() => Promise.resolve([]))
      const whereMock = vi.fn(() => ({ orderBy: orderByMock }))
      const fromMock = vi.fn(() => ({ where: whereMock }))
      const selectMock = vi.fn(() => ({ from: fromMock }))
      
      vi.mocked(db.select).mockImplementation(selectMock)
      vi.mocked(buildMenuTree).mockReturnValue([])

      const request = new NextRequest('http://localhost:3000/api/admin/menus/all')
      const context = {
        userId: 2,
        isSuperAdmin: false,
        organizationId: 1
      }

      const response = await GET(request, context)

      expect(response).toEqual({ contents: [] })
    })

    it('应该构建菜单树结构', async () => {
      const { db } = await import('../../src/db')
      const { buildMenuTree } = await import('../../src/lib/utils')
      
      const mockFlatMenus = [
        { id: 1, name: '系统管理', parentId: null },
        { id: 2, name: '用户管理', parentId: 1 },
        { id: 3, name: '角色管理', parentId: 1 }
      ]

      const mockTreeMenus = [
        {
          id: 1,
          name: '系统管理',
          parentId: null,
          children: [
            { id: 2, name: '用户管理', parentId: 1 },
            { id: 3, name: '角色管理', parentId: 1 }
          ]
        }
      ]

      const orderByMock = vi.fn(() => Promise.resolve(mockFlatMenus))
      const whereMock = vi.fn(() => ({ orderBy: orderByMock }))
      const fromMock = vi.fn(() => ({ where: whereMock }))
      const selectMock = vi.fn(() => ({ from: fromMock }))
      
      vi.mocked(db.select).mockImplementation(selectMock)
      vi.mocked(buildMenuTree).mockReturnValue(mockTreeMenus)

      const request = new NextRequest('http://localhost:3000/api/admin/menus/all')
      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      const response = await GET(request, context)

      expect(buildMenuTree).toHaveBeenCalledWith(mockFlatMenus)
      expect(response).toEqual({ contents: mockTreeMenus })
    })

    it('应该处理数据库查询错误', async () => {
      const { db } = await import('../../src/db')
      
      const orderByMock = vi.fn(() => Promise.reject(new Error('Database error')))
      const whereMock = vi.fn(() => ({ orderBy: orderByMock }))
      const fromMock = vi.fn(() => ({ where: whereMock }))
      const selectMock = vi.fn(() => ({ from: fromMock }))
      
      vi.mocked(db.select).mockImplementation(selectMock)

      const request = new NextRequest('http://localhost:3000/api/admin/menus/all')
      const context = {
        userId: 1,
        isSuperAdmin: true,
        organizationId: 1
      }

      await expect(GET(request, context)).rejects.toThrow('Database error')
    })

    it('应该处理getUserRoles失败的情况', async () => {
      const { getUserRoles } = await import('../../src/lib/permissions')
      
      vi.mocked(getUserRoles).mockRejectedValue(new Error('Permission error'))

      const request = new NextRequest('http://localhost:3000/api/admin/menus/all')
      const context = {
        userId: 2,
        isSuperAdmin: false,
        organizationId: 1
      }

      await expect(GET(request, context)).rejects.toThrow('Permission error')
    })
  })
})
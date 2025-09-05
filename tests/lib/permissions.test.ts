import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUserRoles, getUserPermissions, hasPermission, isSuperAdmin } from '../../src/lib/permissions'

// Mock database
vi.mock('../../src/db', () => ({
  db: {
    select: vi.fn()
  }
}))

describe('permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserRoles', () => {
    it('应该返回用户角色信息', async () => {
      const { db } = await import('../../src/db')
      
      const mockUserRoles = [
        { permissions: [1, 2, 3], name: '管理员', code: 'admin', menus: [1, 2] },
        { permissions: [4, 5], name: '用户', code: 'user', menus: [3] }
      ]

      // Mock用户查询
      const userSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{ roles: [1, 2] }]))
          }))
        }))
      }

      // Mock角色查询
      const roleSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve(mockUserRoles))
        }))
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(userSelectMock as any)
        .mockReturnValueOnce(roleSelectMock as any)

      const result = await getUserRoles(1)

      expect(result).toEqual(mockUserRoles)
    })

    it('应该在用户没有角色时返回空数组', async () => {
      const { db } = await import('../../src/db')
      
      const userSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{ roles: null }]))
          }))
        }))
      }

      vi.mocked(db.select).mockReturnValue(userSelectMock as any)

      const result = await getUserRoles(1)

      expect(result).toEqual([])
    })

    it('应该在用户不存在时返回空数组', async () => {
      const { db } = await import('../../src/db')
      
      const userSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([]))
          }))
        }))
      }

      vi.mocked(db.select).mockReturnValue(userSelectMock as any)

      const result = await getUserRoles(999)

      expect(result).toEqual([])
    })
  })

  describe('getUserPermissions', () => {
    it('应该返回超级管理员的所有权限', async () => {
      const { db } = await import('../../src/db')
      
      const mockUserRoles = [
        { permissions: [1, 2], name: '超级管理员', code: 'system_admin', menus: [1] }
      ]

      // Mock getUserRoles
      const userSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{ roles: [1] }]))
          }))
        }))
      }

      const roleSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve(mockUserRoles))
        }))
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(userSelectMock as any)
        .mockReturnValueOnce(roleSelectMock as any)

      const result = await getUserPermissions(1)

      expect(result).toEqual(['*'])
    })

    it('应该返回普通用户的权限列表', async () => {
      const { db } = await import('../../src/db')
      
      const mockUserRoles = [
        { permissions: [1, 2], name: '用户', code: 'user', menus: [1] }
      ]

      const mockPermissions = [
        { code: 'user_read' },
        { code: 'user_write' }
      ]

      // Mock getUserRoles
      const userSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{ roles: [1] }]))
          }))
        }))
      }

      const roleSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve(mockUserRoles))
        }))
      }

      const permissionSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve(mockPermissions))
        }))
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(userSelectMock as any)
        .mockReturnValueOnce(roleSelectMock as any)
        .mockReturnValueOnce(permissionSelectMock as any)

      const result = await getUserPermissions(1)

      expect(result).toEqual(['user_read', 'user_write'])
    })

    it('应该在用户没有权限时返回空数组', async () => {
      const { db } = await import('../../src/db')
      
      const mockUserRoles = [
        { permissions: [], name: '用户', code: 'user', menus: [] }
      ]

      const userSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{ roles: [1] }]))
          }))
        }))
      }

      const roleSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve(mockUserRoles))
        }))
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(userSelectMock as any)
        .mockReturnValueOnce(roleSelectMock as any)

      const result = await getUserPermissions(1)

      expect(result).toEqual([])
    })
  })

  describe('hasPermission', () => {
    it('应该检查超级管理员权限', async () => {
      const { db } = await import('../../src/db')
      
      const mockUserRoles = [
        { permissions: [1, 2], name: '超级管理员', code: 'system_admin', menus: [1] }
      ]

      const userSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{ roles: [1] }]))
          }))
        }))
      }

      const roleSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve(mockUserRoles))
        }))
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(userSelectMock as any)
        .mockReturnValueOnce(roleSelectMock as any)

      const result = await hasPermission(1, 'any_permission')
      expect(result).toBe(true)
    })

    it('应该检查普通用户权限', async () => {
      const { db } = await import('../../src/db')
      
      const mockUserRoles = [
        { permissions: [1, 2], name: '用户', code: 'user', menus: [1] }
      ]

      const mockPermissions = [
        { code: 'user_read' },
        { code: 'user_write' }
      ]

      const userSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{ roles: [1] }]))
          }))
        }))
      }

      const roleSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve(mockUserRoles))
        }))
      }

      const permissionSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve(mockPermissions))
        }))
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(userSelectMock as any)
        .mockReturnValueOnce(roleSelectMock as any)
        .mockReturnValueOnce(permissionSelectMock as any)

      const result = await hasPermission(1, 'user_read')
      expect(result).toBe(true)
    })
  })

  describe('isSuperAdmin', () => {
    it('应该识别超级管理员', async () => {
      const { db } = await import('../../src/db')
      
      const userSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{ roles: [1] }]))
          }))
        }))
      }

      const roleSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([{ isSuperAdmin: 'system_admin' }]))
        }))
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(userSelectMock as any)
        .mockReturnValueOnce(roleSelectMock as any)

      const result = await isSuperAdmin(1)

      expect(result).toBe(true)
    })

    it('应该识别普通用户', async () => {
      const { db } = await import('../../src/db')
      
      const userSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{ roles: [1] }]))
          }))
        }))
      }

      const roleSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([{ isSuperAdmin: 'user' }]))
        }))
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(userSelectMock as any)
        .mockReturnValueOnce(roleSelectMock as any)

      const result = await isSuperAdmin(1)

      expect(result).toBe(false)
    })

    it('应该在用户没有角色时返回false', async () => {
      const { db } = await import('../../src/db')
      
      const userSelectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{ roles: null }]))
          }))
        }))
      }

      vi.mocked(db.select).mockReturnValue(userSelectMock as any)

      const result = await isSuperAdmin(1)

      expect(result).toBe(false)
    })
  })
})
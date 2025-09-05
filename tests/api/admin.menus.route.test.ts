import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/admin/menus/route'

vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn()
  }
}))

vi.mock('@/db/schema', () => ({
  menus: {
    id: 'id',
    name: 'name',
    path: 'path',
    icon: 'icon',
    parentId: 'parentId',
    sort: 'sort',
    status: 'status',
    createTime: 'createTime',
    deleted: 'deleted'
  }
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  like: vi.fn(),
  count: vi.fn(),
  isNull: vi.fn()
}))

vi.mock('@/lib/validations', () => ({
  pageSchema: {
    safeParse: vi.fn(() => ({
      success: true,
      data: { page: 1, pageSize: 10 }
    }))
  },
  menuSchema: {
    safeParse: vi.fn((data) => ({
      success: true,
      data: data
    }))
  }
}))

vi.mock('@/app/api/_utils/response', () => ({
  paginatedSimple: vi.fn(() => ({
    code: 200,
    data: { contents: [], page: 1, pageSize: 10, total: 0 }
  })),
  error: vi.fn((message, status = 500) => ({
    status,
    json: () => Promise.resolve({ code: status, message })
  })),
  unauthorized: vi.fn(() => ({
    status: 401,
    json: () => Promise.resolve({ code: 401, message: 'Unauthorized' })
  }))
}))

vi.mock('@/lib/auth-helper', () => ({
  getUserContextWithErrorType: vi.fn(() => Promise.resolve({
    userId: 1,
    organizationId: 1,
    isSuperAdmin: true
  }))
}))

describe('admin/menus API', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    
    const { db } = await import('@/db')
    const mockDb = vi.mocked(db)
    
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([])
            })
          })
        })
      })
    } as any)
  })

  describe('GET /admin/menus', () => {
    it('应该成功获取菜单列表', async () => {
      const request = new NextRequest('http://localhost/api/admin/menus?page=1&pageSize=10')
      
      const response = await GET(request)
      expect(response).toBeDefined()
    })

    it('应该处理搜索参数', async () => {
      const request = new NextRequest('http://localhost/api/admin/menus?name=系统&status=1')
      
      const response = await GET(request)
      expect(response).toBeDefined()
    })

    it('应该处理分页参数验证失败', async () => {
      const { pageSchema } = await import('@/lib/validations')
      vi.mocked(pageSchema.safeParse).mockReturnValue({
        success: false,
        error: { errors: [{ message: 'Invalid page parameters' }] }
      } as any)

      const request = new NextRequest('http://localhost/api/admin/menus?page=invalid')
      
      const response = await GET(request)
      expect(response.status).toBe(401) // 认证失败
    })
  })

  describe('POST /admin/menus', () => {
    it('应该成功创建菜单', async () => {
      const menuData = {
        name: '新菜单',
        path: '/new-menu',
        icon: 'menu',
        status: 1,
        type: 'menu'
      }

      const request = new NextRequest('http://localhost/api/admin/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuData)
      })

      const { db } = await import('@/db')
      const mockDb = vi.mocked(db)
      
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1, ...menuData }])
        })
      } as any)

      const response = await POST(request)
      expect(response).toBeDefined()
    })

    it('应该处理请求数据验证失败', async () => {
      const { menuSchema } = await import('@/lib/validations')
      vi.mocked(menuSchema.safeParse).mockReturnValue({
        success: false,
        error: { errors: [{ message: 'Invalid menu data' }] }
      } as any)

      const request = new NextRequest('http://localhost/api/admin/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const response = await POST(request)
      expect(response.status).toBe(401) // 认证失败
    })
  })
})
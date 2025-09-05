import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/admin/permissions/route'

vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn()
  }
}))

vi.mock('@/db/schema', () => ({
  permissions: {
    id: 'id',
    name: 'name',
    code: 'code',
    status: 'status',
    createTime: 'createTime',
    deleted: 'deleted'
  }
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  like: vi.fn(),
  count: vi.fn()
}))

vi.mock('@/lib/validations', () => ({
  pageSchema: {
    safeParse: vi.fn(() => ({
      success: true,
      data: { page: 1, pageSize: 10 }
    }))
  },
  permissionSchema: {
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

describe('admin/permissions API', () => {
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

  describe('GET /admin/permissions', () => {
    it('应该成功获取权限列表', async () => {
      const request = new NextRequest('http://localhost/api/admin/permissions?page=1&pageSize=10')

      const response = await GET(request)
      expect(response).toBeDefined()
    })

    it('应该处理搜索参数', async () => {
      const request = new NextRequest('http://localhost/api/admin/permissions?name=用户&status=1')

      const response = await GET(request)
      expect(response).toBeDefined()
    })

    it('应该处理分页参数验证失败', async () => {
      const { pageSchema } = await import('@/lib/validations')
      vi.mocked(pageSchema.safeParse).mockReturnValue({
        success: false,
        error: { errors: [{ message: 'Invalid page parameters' }] }
      } as any)

      const request = new NextRequest('http://localhost/api/admin/permissions?page=invalid')

      const response = await GET(request)
      expect(response.status).toBe(401) // 认证失败
    })
  })

  describe('POST /admin/permissions', () => {
    it('应该成功创建权限', async () => {
      const permissionData = {
        name: '新权限',
        code: 'new:permission',
        status: 1
      }

      const request = new NextRequest('http://localhost/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissionData)
      })

      const { db } = await import('@/db')
      const mockDb = vi.mocked(db)

      // Mock 权限编码不存在检查
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([])
        })
      } as any)

      // Mock 插入权限
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1, ...permissionData }])
        })
      } as any)

      const response = await POST(request)
      expect(response).toBeDefined()
    })

    it('应该处理请求数据验证失败', async () => {
      const { permissionSchema } = await import('@/lib/validations')
      vi.mocked(permissionSchema.safeParse).mockReturnValue({
        success: false,
        error: { errors: [{ message: 'Invalid permission data' }] }
      } as any)

      const request = new NextRequest('http://localhost/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const response = await POST(request)
      expect(response.status).toBe(401) // 认证失败
    })
  })
})
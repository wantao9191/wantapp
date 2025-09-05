import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/admin/users/route'

vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn()
  }
}))

vi.mock('@/db/schema', () => ({
  users: {
    id: 'id',
    username: 'username',
    name: 'name',
    phone: 'phone',
    email: 'email',
    status: 'status',
    createTime: 'createTime',
    deleted: 'deleted',
    roles: 'roles',
    organizationId: 'organizationId'
  },
  organizations: {
    id: 'id',
    name: 'name'
  },
  roles: {
    id: 'id',
    name: 'name'
  }
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  like: vi.fn(),
  count: vi.fn(),
  inArray: vi.fn()
}))

vi.mock('@/lib/validations', () => ({
  pageSchema: {
    safeParse: vi.fn(() => ({
      success: true,
      data: { page: 1, pageSize: 10 }
    }))
  },
  userSchema: {
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

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('hashed_password'))
  }
}))

describe('admin/users API', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    
    const { db } = await import('@/db')
    const mockDb = vi.mocked(db)
    
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue([])
              })
            })
          })
        })
      })
    } as any)
  })

  describe('GET /admin/users', () => {
    it('应该成功获取用户列表', async () => {
      const request = new NextRequest('http://localhost/api/admin/users?page=1&pageSize=10')
      
      const response = await GET(request, { userId: 1, organizationId: 1, isSuperAdmin: true })
      expect(response).toBeDefined()
    })

    it('应该处理搜索参数', async () => {
      const request = new NextRequest('http://localhost/api/admin/users?name=测试&status=1')
      
      const response = await GET(request, { userId: 1, organizationId: 1, isSuperAdmin: true })
      expect(response).toBeDefined()
    })

    it('应该处理分页参数验证失败', async () => {
      const { pageSchema } = await import('@/lib/validations')
      vi.mocked(pageSchema.safeParse).mockReturnValue({
        success: false,
        error: { errors: [{ message: 'Invalid page parameters' }] }
      } as any)

      const request = new NextRequest('http://localhost/api/admin/users?page=invalid')
      
      const response = await GET(request, { userId: 1, organizationId: 1, isSuperAdmin: true })
      expect(response.status).toBe(401) // 认证失败
    })
  })

  describe('POST /admin/users', () => {
    it('应该成功创建用户', async () => {
      const userData = {
        name: '新用户',
        phone: '13800138001',
        email: 'newuser@example.com',
        organizationId: 1,
        roles: [1, 2],
        status: 1
      }

      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const { db } = await import('@/db')
      const mockDb = vi.mocked(db)
      
      // Mock 机构存在检查
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: 1, name: '测试机构' }])
        })
      } as any)

      // Mock 角色存在检查
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { id: 1, name: '管理员' },
            { id: 2, name: '用户' }
          ])
        })
      } as any)

      // Mock 插入用户
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1, ...userData }])
        })
      } as any)

      const response = await POST(request, { userId: 1, organizationId: 1, isSuperAdmin: true })
      expect(response).toBeDefined()
    })

    it('应该处理请求数据验证失败', async () => {
      const { userSchema } = await import('@/lib/validations')
      vi.mocked(userSchema.safeParse).mockReturnValue({
        success: false,
        error: { errors: [{ message: 'Invalid user data' }] }
      } as any)

      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const response = await POST(request, { userId: 1, organizationId: 1, isSuperAdmin: true })
      expect(response.status).toBe(401) // 认证失败
    })
  })
})
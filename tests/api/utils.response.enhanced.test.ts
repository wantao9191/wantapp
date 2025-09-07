import { describe, it, expect } from 'vitest'
import { ok, error, methodNotAllowed, badRequest, unauthorized, forbidden, notFound, paginatedSimple } from '../../src/app/api/_utils/response'

function readJson(res: Response) { return res.json() as Promise<any> }

describe('api/_utils/response - Enhanced Tests', () => {
  describe('ok()', () => {
    it('应该返回成功响应', async () => {
      const res = ok({ message: 'success' })
      const body = await readJson(res)
      
      expect(res.status).toBe(200)
      expect(body).toEqual({
        code: 200,
        message: 'OK',
        data: { message: 'success' }
      })
    })

    it('应该支持自定义消息', async () => {
      const res = ok({ id: 1 }, 'Created successfully')
      const body = await readJson(res)
      
      expect(res.status).toBe(200)
      expect(body).toEqual({
        code: 200,
        message: 'Created successfully',
        data: { id: 1 }
      })
    })

    it('应该支持自定义响应选项', async () => {
      const res = ok({ data: 'test' }, 'OK', { 
        headers: { 'X-Custom-Header': 'value' } 
      })
      
      expect(res.headers.get('X-Custom-Header')).toBe('value')
    })

    it('应该处理null数据', async () => {
      const res = ok(null)
      const body = await readJson(res)
      
      expect(body.data).toBeNull()
    })

    it('应该处理undefined数据', async () => {
      const res = ok(undefined)
      const body = await readJson(res)
      
      expect(body.data).toBeUndefined()
    })

    it('应该处理复杂对象', async () => {
      const complexData = {
        user: { id: 1, name: 'John' },
        permissions: ['read', 'write'],
        metadata: { created: '2023-01-01' }
      }
      
      const res = ok(complexData)
      const body = await readJson(res)
      
      expect(body.data).toEqual(complexData)
    })
  })

  describe('error()', () => {
    it('应该返回错误响应', async () => {
      const res = error('Something went wrong', 500)
      const body = await readJson(res)
      
      expect(res.status).toBe(500)
      expect(body).toEqual({
        code: 500,
        message: 'Something went wrong'
      })
    })

    it('应该使用默认错误消息', async () => {
      const res = error()
      const body = await readJson(res)
      
      expect(res.status).toBe(500)
      expect(body).toEqual({
        code: 500,
        message: 'Server Error'
      })
    })

    it('应该使用默认状态码', async () => {
      const res = error('Custom error')
      const body = await readJson(res)
      
      expect(res.status).toBe(500)
      expect(body.code).toBe(500)
    })

    it('应该支持自定义响应选项', async () => {
      const res = error('Error', 400, { 
        headers: { 'X-Error-Code': 'VALIDATION_FAILED' } 
      })
      
      expect(res.headers.get('X-Error-Code')).toBe('VALIDATION_FAILED')
    })

    it('应该处理不同的状态码', async () => {
      const testCases = [
        { code: 400, message: 'Bad Request' },
        { code: 401, message: 'Unauthorized' },
        { code: 403, message: 'Forbidden' },
        { code: 404, message: 'Not Found' },
        { code: 422, message: 'Unprocessable Entity' },
        { code: 500, message: 'Internal Server Error' }
      ]

      for (const testCase of testCases) {
        const res = error(testCase.message, testCase.code)
        const body = await readJson(res)
        
        expect(res.status).toBe(testCase.code)
        expect(body.code).toBe(testCase.code)
        expect(body.message).toBe(testCase.message)
      }
    })
  })

  describe('methodNotAllowed()', () => {
    it('应该返回 405 响应', async () => {
      const res = methodNotAllowed(['GET', 'POST'])
      const body = await readJson(res)
      
      expect(res.status).toBe(405)
      expect(res.headers.get('Allow')).toBe('GET, POST')
      expect(body.code).toBe(405)
      expect(body.message).toContain('Method Not Allowed')
      expect(body.message).toContain('GET, POST')
    })

    it('应该处理单个方法', async () => {
      const res = methodNotAllowed(['GET'])
      const body = await readJson(res)
      
      expect(res.headers.get('Allow')).toBe('GET')
      expect(body.message).toContain('GET')
    })

    it('应该处理多个方法', async () => {
      const res = methodNotAllowed(['GET', 'POST', 'PUT', 'DELETE'])
      const body = await readJson(res)
      
      expect(res.headers.get('Allow')).toBe('GET, POST, PUT, DELETE')
      expect(body.message).toContain('GET, POST, PUT, DELETE')
    })

    it('应该处理空方法数组', async () => {
      const res = methodNotAllowed([])
      const body = await readJson(res)
      
      expect(res.headers.get('Allow')).toBe('')
    })
  })

  describe('badRequest()', () => {
    it('应该返回 400 响应', async () => {
      const res = badRequest('Invalid input')
      const body = await readJson(res)
      
      expect(res.status).toBe(400)
      expect(body.code).toBe(400)
      expect(body.message).toBe('Invalid input')
    })

    it('应该使用默认消息', async () => {
      const res = badRequest()
      const body = await readJson(res)
      
      expect(res.status).toBe(400)
      expect(body.message).toBe('Bad Request')
    })

    it('应该处理详细的验证错误', async () => {
      const res = badRequest('Username is required and must be at least 3 characters long')
      const body = await readJson(res)
      
      expect(body.message).toBe('Username is required and must be at least 3 characters long')
    })
  })

  describe('unauthorized()', () => {
    it('应该返回 401 响应', async () => {
      const res = unauthorized('Access denied')
      const body = await readJson(res)
      
      expect(res.status).toBe(401)
      expect(body.code).toBe(401)
      expect(body.message).toBe('Access denied')
    })

    it('应该使用默认消息', async () => {
      const res = unauthorized()
      const body = await readJson(res)
      
      expect(res.status).toBe(401)
      expect(body.message).toBe('Unauthorized')
    })

    it('应该处理不同的认证错误', async () => {
      const testCases = [
        'Token expired',
        'Invalid credentials',
        'Authentication required',
        'Invalid token format'
      ]

      for (const message of testCases) {
        const res = unauthorized(message)
        const body = await readJson(res)
        
        expect(res.status).toBe(401)
        expect(body.message).toBe(message)
      }
    })
  })

  describe('forbidden()', () => {
    it('应该返回 403 响应', async () => {
      const res = forbidden('Insufficient permissions')
      const body = await readJson(res)
      
      expect(res.status).toBe(403)
      expect(body.code).toBe(403)
      expect(body.message).toBe('Insufficient permissions')
    })

    it('应该使用默认消息', async () => {
      const res = forbidden()
      const body = await readJson(res)
      
      expect(res.status).toBe(403)
      expect(body.message).toBe('Forbidden')
    })

    it('应该处理不同的权限错误', async () => {
      const testCases = [
        'Access denied to this resource',
        'Admin privileges required',
        'Organization access required',
        'Missing permission: user:write'
      ]

      for (const message of testCases) {
        const res = forbidden(message)
        const body = await readJson(res)
        
        expect(res.status).toBe(403)
        expect(body.message).toBe(message)
      }
    })
  })

  describe('notFound()', () => {
    it('应该返回 404 响应', async () => {
      const res = notFound('Resource not found')
      const body = await readJson(res)
      
      expect(res.status).toBe(404)
      expect(body.code).toBe(404)
      expect(body.message).toBe('Resource not found')
    })

    it('应该使用默认消息', async () => {
      const res = notFound()
      const body = await readJson(res)
      
      expect(res.status).toBe(404)
      expect(body.message).toBe('Not Found')
    })

    it('应该处理不同的资源未找到错误', async () => {
      const testCases = [
        'User not found',
        'Organization not found',
        'Permission not found',
        'Role not found',
        'Menu not found'
      ]

      for (const message of testCases) {
        const res = notFound(message)
        const body = await readJson(res)
        
        expect(res.status).toBe(404)
        expect(body.message).toBe(message)
      }
    })
  })

  describe('paginatedSimple()', () => {
    it('应该返回分页结果', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const result = paginatedSimple(items, 1, 10, 25)
      
      expect(result).toEqual({
        contents: items,
        page: 1,
        pageSize: 10,
        total: 25,
        totalPages: 3
      })
    })

    it('应该正确计算总页数', () => {
      const items = [{ id: 1 }]
      
      // 测试整除情况
      const result1 = paginatedSimple(items, 1, 10, 20)
      expect(result1.totalPages).toBe(2)
      
      // 测试有余数情况
      const result2 = paginatedSimple(items, 1, 10, 25)
      expect(result2.totalPages).toBe(3)
      
      // 测试零条记录
      const result3 = paginatedSimple([], 1, 10, 0)
      expect(result3.totalPages).toBe(0)
    })

    it('应该处理第一页', () => {
      const items = Array.from({ length: 5 }, (_, i) => ({ id: i + 1 }))
      const result = paginatedSimple(items, 1, 5, 20)
      
      expect(result.page).toBe(1)
      expect(result.contents).toHaveLength(5)
      expect(result.totalPages).toBe(4)
    })

    it('应该处理最后一页', () => {
      const items = Array.from({ length: 3 }, (_, i) => ({ id: i + 16 }))
      const result = paginatedSimple(items, 4, 5, 18)
      
      expect(result.page).toBe(4)
      expect(result.contents).toHaveLength(3)
      expect(result.totalPages).toBe(4)
    })

    it('应该处理空结果', () => {
      const result = paginatedSimple([], 1, 10, 0)
      
      expect(result).toEqual({
        contents: [],
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
      })
    })

    it('应该处理单条记录', () => {
      const items = [{ id: 1, name: 'Test' }]
      const result = paginatedSimple(items, 1, 10, 1)
      
      expect(result).toEqual({
        contents: items,
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1
      })
    })

    it('应该处理大数据集', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }))
      const result = paginatedSimple(items, 5, 100, 1000)
      
      expect(result.page).toBe(5)
      expect(result.pageSize).toBe(100)
      expect(result.total).toBe(1000)
      expect(result.totalPages).toBe(10)
      expect(result.contents).toHaveLength(100)
    })

    it('应该处理不同的页面大小', () => {
      const testCases = [
        { pageSize: 1, total: 10, expectedPages: 10 },
        { pageSize: 5, total: 10, expectedPages: 2 },
        { pageSize: 10, total: 10, expectedPages: 1 },
        { pageSize: 20, total: 10, expectedPages: 1 },
        { pageSize: 3, total: 10, expectedPages: 4 }
      ]

      for (const testCase of testCases) {
        const items = Array.from({ length: Math.min(testCase.pageSize, testCase.total) }, (_, i) => ({ id: i + 1 }))
        const result = paginatedSimple(items, 1, testCase.pageSize, testCase.total)
        
        expect(result.totalPages).toBe(testCase.expectedPages)
        expect(result.pageSize).toBe(testCase.pageSize)
        expect(result.total).toBe(testCase.total)
      }
    })

    it('应该处理边界情况', () => {
      // 页面大小为0的情况
      expect(() => paginatedSimple([], 1, 0, 10)).not.toThrow()
      
      // 负数页面的情况
      const result1 = paginatedSimple([{ id: 1 }], -1, 10, 10)
      expect(result1.page).toBe(-1)
      
      // 负数总数的情况
      const result2 = paginatedSimple([], 1, 10, -5)
      expect(result2.total).toBe(-5)
      expect(result2.totalPages).toBe(-1) // Math.ceil(-5/10) = -1
    })
  })

  describe('响应格式一致性', () => {
    it('所有成功响应应该有相同的结构', async () => {
      const res = ok({ test: 'data' }, 'Success')
      const body = await readJson(res)
      
      expect(body).toHaveProperty('code')
      expect(body).toHaveProperty('message')
      expect(body).toHaveProperty('data')
      expect(typeof body.code).toBe('number')
      expect(typeof body.message).toBe('string')
    })

    it('所有错误响应应该有相同的结构', async () => {
      const errorFunctions = [
        () => error('Test error', 500),
        () => badRequest('Test bad request'),
        () => unauthorized('Test unauthorized'),
        () => forbidden('Test forbidden'),
        () => notFound('Test not found')
      ]

      for (const errorFn of errorFunctions) {
        const res = errorFn()
        const body = await readJson(res)
        
        expect(body).toHaveProperty('code')
        expect(body).toHaveProperty('message')
        expect(typeof body.code).toBe('number')
        expect(typeof body.message).toBe('string')
      }
    })

    it('应该正确设置Content-Type头', async () => {
      const responses = [
        ok({ test: 'data' }),
        error('Test error'),
        badRequest('Test'),
        unauthorized('Test'),
        forbidden('Test'),
        notFound('Test')
      ]

      for (const res of responses) {
        expect(res.headers.get('content-type')).toBe('application/json')
      }
    })
  })

  describe('性能和内存测试', () => {
    it('应该处理大量数据而不出现内存问题', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: `Description for item ${i}`.repeat(10)
      }))

      expect(() => {
        const res = ok(largeData)
        expect(res).toBeDefined()
      }).not.toThrow()
    })

    it('应该处理深层嵌套对象', () => {
      const deepObject = { level1: { level2: { level3: { level4: { level5: 'deep value' } } } } }

      expect(() => {
        const res = ok(deepObject)
        expect(res).toBeDefined()
      }).not.toThrow()
    })

    it('应该处理循环引用（如果JSON.stringify能处理）', async () => {
      const obj: any = { name: 'test' }
      obj.self = obj // 创建循环引用

      // JSON.stringify会抛出错误，但我们的函数应该能处理这种情况
      expect(() => {
        ok(obj)
      }).toThrow() // 这是预期的，因为JSON.stringify不能处理循环引用
    })
  })
})
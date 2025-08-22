import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHandler, type Handler, type HandlerWithParams, type Handlers } from '@/app/api/_utils/handler'
import { NextResponse } from 'next/server'

// Mock NextRequest
class MockRequest {
  public headers: Map<string, string>
  public method: string
  public url: string

  constructor(method: string = 'GET', headers?: Record<string, string>) {
    this.method = method
    this.headers = new Map()
    this.url = 'http://localhost:3000/api/test'
    
    // 默认认证头
    this.headers.set('X-User-Id', '123')
    this.headers.set('X-User-Roles', '[1,2]')
    
    // 添加自定义头
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        this.headers.set(key, value)
      })
    }
  }

  get(name: string): string | null {
    return this.headers.get(name) || null
  }
}

// Mock auth helper functions
vi.mock('@/lib/auth-helper', () => ({
  checkPermission: vi.fn(),
  getUserIdFromHeaders: vi.fn()
}))

import { checkPermission, getUserIdFromHeaders } from '@/lib/auth-helper'

describe('api/_utils/handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 默认模拟认证成功
    vi.mocked(getUserIdFromHeaders).mockReturnValue(123)
    vi.mocked(checkPermission).mockResolvedValue(null)
  })

  describe('createHandler - Single Handler', () => {
    it('应该成功处理单个处理器并返回数据', async () => {
      const handler = createHandler(async () => ({ a: 1 }), { requireAuth: false })
      const res = await handler(new MockRequest('GET') as any)
      const body = await res.json()
      
      expect(body.code).toBe(200)
      expect(body.data).toEqual({ a: 1 })
    })

    it('应该直接返回 NextResponse', async () => {
      const handler = createHandler(
        async () => NextResponse.json({ ok: true }, { status: 201 }), 
        { requireAuth: false }
      )
      const res = await handler(new MockRequest('GET') as any)
      
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.ok).toBe(true)
    })

    it('应该处理同步处理器', async () => {
      const handler = createHandler(() => ({ sync: true }), { requireAuth: false })
      const res = await handler(new MockRequest('GET') as any)
      const body = await res.json()
      
      expect(body.code).toBe(200)
      expect(body.data).toEqual({ sync: true })
    })

    it('应该处理处理器抛出的错误', async () => {
      const err = new Error('测试错误') as any
      err.status = 418
      
      const handler = createHandler(async () => { throw err }, { requireAuth: false })
      const res = await handler(new MockRequest('GET') as any)
      
      expect(res.status).toBe(418)
      const body = await res.json()
      expect(body.message).toBe('测试错误')
    })

    it('应该处理未知错误', async () => {
      const handler = createHandler(async () => { throw '字符串错误' }, { requireAuth: false })
      const res = await handler(new MockRequest('GET') as any)
      
      expect(res.status).toBe(500)
      const body = await res.json()
      expect(body.message).toBe('Internal Server Error')
    })
  })

  describe('createHandler - Multiple Handlers', () => {
    it('应该根据 HTTP 方法路由到正确的处理器', async () => {
      const handlers: Handlers = {
        GET: () => ({ method: 'GET' }),
        POST: () => ({ method: 'POST' }),
        PUT: () => ({ method: 'PUT' }),
        DELETE: () => ({ method: 'DELETE' })
      }
      
      const handler = createHandler(handlers, { requireAuth: false })
      
      const resGET = await handler(new MockRequest('GET') as any)
      const resPOST = await handler(new MockRequest('POST') as any)
      const resPUT = await handler(new MockRequest('PUT') as any)
      const resDELETE = await handler(new MockRequest('DELETE') as any)
      
      expect((await resGET.json()).data).toEqual({ method: 'GET' })
      expect((await resPOST.json()).data).toEqual({ method: 'POST' })
      expect((await resPUT.json()).data).toEqual({ method: 'PUT' })
      expect((await resDELETE.json()).data).toEqual({ method: 'DELETE' })
    })

    it('应该返回 405 当请求方法不被支持', async () => {
      const handlers: Handlers = { GET: () => ({}) }
      const handler = createHandler(handlers, { requireAuth: false })
      
      const res = await handler(new MockRequest('PATCH') as any)
      
      expect(res.status).toBe(405)
      const body = await res.json()
      expect(body.message).toBe('Method Not Allowed')
      expect(res.headers.get('Allow')).toBe('GET')
    })

    it('应该处理多个处理器中的错误', async () => {
      const handlers: Handlers = {
        GET: () => ({ ok: true }),
        POST: async () => { throw new Error('POST 错误') }
      }
      
      const handler = createHandler(handlers, { requireAuth: false })
      
      const resGET = await handler(new MockRequest('GET') as any)
      const resPOST = await handler(new MockRequest('POST') as any)
      
      expect((await resGET.json()).code).toBe(200)
      expect(resPOST.status).toBe(500)
      expect((await resPOST.json()).message).toBe('POST 错误')
    })
  })

  describe('Authentication & Authorization', () => {
    it('应该要求认证当 requireAuth 为 true', async () => {
      vi.mocked(getUserIdFromHeaders).mockReturnValue(null)
      
      const handler = createHandler(async () => ({ ok: true }))
      const res = await handler(new MockRequest('GET') as any)
      
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.message).toBe('Authentication required')
    })

    it('应该跳过认证当 requireAuth 为 false', async () => {
      const handler = createHandler(async () => ({ ok: true }), { requireAuth: false })
      const res = await handler(new MockRequest('GET') as any)
      
      expect(res.status).toBe(200)
      expect(vi.mocked(getUserIdFromHeaders)).not.toHaveBeenCalled()
    })

    it('应该检查权限当指定了 permission', async () => {
      vi.mocked(checkPermission).mockResolvedValue(NextResponse.json({ error: '权限不足' }, { status: 403 }))
      
      const handler = createHandler(async () => ({ ok: true }), { permission: 'admin:read' })
      const res = await handler(new MockRequest('GET') as any)
      
      expect(res.status).toBe(403)
      expect(vi.mocked(checkPermission)).toHaveBeenCalledWith(expect.any(MockRequest), 'admin:read')
    })

    it('应该传递用户ID到处理器上下文', async () => {
      let receivedContext: any
      const handler = createHandler(async (req: any, context: any) => {
        receivedContext = context
        return { ok: true }
      })
      
      await handler(new MockRequest('GET') as any)
      
      expect(receivedContext).toEqual({ userId: 123 })
    })
  })

  describe('Parameters Handling', () => {
    it('应该验证参数当 hasParams 为 true', async () => {
      const handler = createHandler(
        async (req: any, params: any) => ({ id: params.id }),
        { hasParams: true, requireAuth: false }
      )
      
      const res = await handler(new MockRequest('GET') as any, { id: '123' })
      const body = await res.json()
      
      expect(body.code).toBe(200)
      expect(body.data).toEqual({ id: '123' })
    })

    it('应该拒绝无效的 ID 参数', async () => {
      const handler = createHandler(
        async (req: any, params: any) => ({ id: params.id }),
        { hasParams: true, requireAuth: false }
      )
      
      const res = await handler(new MockRequest('GET') as any, { id: '0' })
      expect(res.status).toBe(400)
      
      const res2 = await handler(new MockRequest('GET') as any, { id: '-1' })
      expect(res2.status).toBe(400)
      
      const res3 = await handler(new MockRequest('GET') as any, { id: 'abc' })
      expect(res3.status).toBe(400)
    })

    it('应该拒绝缺失的参数', async () => {
      const handler = createHandler(
        async (req: any, params: any) => ({ id: params.id }),
        { hasParams: true, requireAuth: false }
      )
      
      const res = await handler(new MockRequest('GET') as any)
      expect(res.status).toBe(400)
      
      const res2 = await handler(new MockRequest('GET') as any, { id: '0' })
      expect(res2.status).toBe(400)
    })

    it('应该处理 Promise 参数', async () => {
      const handler = createHandler(
        async (req: any, params: any) => ({ id: params.id }),
        { hasParams: true, requireAuth: false }
      )
      
      const paramsPromise = Promise.resolve({ id: '456' })
      const res = await handler(new MockRequest('GET') as any, paramsPromise)
      const body = await res.json()
      
      expect(body.code).toBe(200)
      expect(body.data).toEqual({ id: '456' })
    })

    it('应该处理嵌套的 params Promise 结构', async () => {
      const handler = createHandler(
        async (req: any, params: any) => ({ id: params.id }),
        { hasParams: true, requireAuth: false }
      )
      
      const nestedParams = { params: Promise.resolve({ id: '789' }) }
      const res = await handler(new MockRequest('GET') as any, nestedParams)
      const body = await res.json()
      
      expect(body.code).toBe(200)
      expect(body.data).toEqual({ id: '789' })
    })

    it('应该检测处理器是否支持参数', async () => {
      // 支持参数的处理器
      const handlerWithParams = createHandler(
        async (req: any, params: any) => ({ id: params.id }),
        { hasParams: true, requireAuth: false }
      )
      
      // 不支持参数的处理器
      const handlerWithoutParams = createHandler(
        async (req: any) => ({ ok: true }),
        { hasParams: true, requireAuth: false }
      )
      
      const res1 = await handlerWithParams(new MockRequest('GET') as any, { id: '123' })
      expect(res1.status).toBe(200)
      
      const res2 = await handlerWithoutParams(new MockRequest('GET') as any, { id: '123' })
      expect(res2.status).toBe(500)
      expect((await res2.json()).message).toBe('Handler does not support parameters')
    })
  })

  describe('Edge Cases', () => {
    it('应该处理空响应', async () => {
      const handler = createHandler(async () => null, { requireAuth: false })
      const res = await handler(new MockRequest('GET') as any)
      const body = await res.json()
      
      expect(body.code).toBe(200)
      expect(body.data).toBeNull()
    })

    it('应该处理 undefined 响应', async () => {
      const handler = createHandler(async () => undefined, { requireAuth: false })
      const res = await handler(new MockRequest('GET') as any)
      const body = await res.json()
      
      expect(body.code).toBe(200)
      expect(body.data).toBeUndefined()
    })

    it('应该处理大数字 ID', async () => {
      const handler = createHandler(
        async (req, params) => ({ id: params.id }),
        { hasParams: true, requireAuth: false }
      )
      
      const res = await handler(new MockRequest('GET') as any, { id: '999999999' })
      const body = await res.json()
      
      expect(body.code).toBe(200)
      expect(body.data).toEqual({ id: '999999999' })
    })

    it('应该处理字符串 ID 转换为数字', async () => {
      const handler = createHandler(
        async (req, params) => ({ id: params.id }),
        { hasParams: true, requireAuth: false }
      )
      
      const res = await handler(new MockRequest('GET') as any, { id: '42' })
      const body = await res.json()
      
      expect(body.code).toBe(200)
      expect(body.data).toEqual({ id: '42' })
    })
  })

  describe('Type Safety', () => {
    it('应该正确推断 Handler 类型', async () => {
      const handler: Handler = async (req) => ({ type: 'handler' })
      const wrapped = createHandler(handler, { requireAuth: false })
      
      const res = await wrapped(new MockRequest('GET') as any)
      const body = await res.json()
      
      expect(body.data).toEqual({ type: 'handler' })
    })

    it('应该正确推断 HandlerWithParams 类型', async () => {
      const handler: HandlerWithParams = async (req, params) => ({ type: 'handlerWithParams', id: params.id })
      const wrapped = createHandler(handler, { hasParams: true, requireAuth: false })
      
      const res = await wrapped(new MockRequest('GET') as any, { id: '123' })
      const body = await res.json()
      
      expect(body.data).toEqual({ type: 'handlerWithParams', id: '123' })
    })

    it('应该正确推断 Handlers 类型', async () => {
      const handlers: Handlers = {
        GET: async () => ({ type: 'get' }),
        POST: async () => ({ type: 'post' })
      }
      const wrapped = createHandler(handlers, { requireAuth: false })
      
      const resGET = await wrapped(new MockRequest('GET') as any)
      const resPOST = await wrapped(new MockRequest('POST') as any)
      
      expect((await resGET.json()).data).toEqual({ type: 'get' })
      expect((await resPOST.json()).data).toEqual({ type: 'post' })
    })
  })

  describe('Additional Edge Cases & Error Handling', () => {
    it('应该处理处理器返回 NextResponse 的情况（带参数）', async () => {
      const handler = createHandler(
        async (req: any, params: any) => NextResponse.json({ id: params.id }, { status: 202 }),
        { hasParams: true, requireAuth: false }
      )
      
      const res = await handler(new MockRequest('GET') as any, { id: '123' })
      expect(res.status).toBe(202)
      const body = await res.json()
      expect(body.id).toBe('123')
    })

    it('应该处理处理器返回 NextResponse 的情况（不带参数）', async () => {
      const handler = createHandler(
        async () => NextResponse.json({ ok: true }, { status: 203 }),
        { requireAuth: false }
      )
      
      const res = await handler(new MockRequest('GET') as any)
      expect(res.status).toBe(203)
      const body = await res.json()
      expect(body.ok).toBe(true)
    })

    it('应该处理多个处理器中带参数的 NextResponse 返回', async () => {
      const handlers: Handlers = {
        GET: async (req: any, params: any) => NextResponse.json({ method: 'GET', id: params.id }, { status: 202 }),
        POST: async (req: any, params: any) => NextResponse.json({ method: 'POST', id: params.id }, { status: 203 })
      }
      
      const handler = createHandler(handlers, { hasParams: true, requireAuth: false })
      
      const resGET = await handler(new MockRequest('GET') as any, { id: '123' })
      const resPOST = await handler(new MockRequest('POST') as any, { id: '456' })
      
      expect(resGET.status).toBe(202)
      expect(resPOST.status).toBe(203)
      
      const bodyGET = await resGET.json()
      const bodyPOST = await resPOST.json()
      
      expect(bodyGET).toEqual({ method: 'GET', id: '123' })
      expect(bodyPOST).toEqual({ method: 'POST', id: '456' })
    })

    it('应该处理多个处理器中不带参数的 NextResponse 返回', async () => {
      const handlers: Handlers = {
        GET: async () => NextResponse.json({ method: 'GET' }, { status: 202 }),
        POST: async () => NextResponse.json({ method: 'POST' }, { status: 203 })
      }
      
      const handler = createHandler(handlers, { requireAuth: false })
      
      const resGET = await handler(new MockRequest('GET') as any)
      const resPOST = await handler(new MockRequest('POST') as any)
      
      expect(resGET.status).toBe(202)
      expect(resPOST.status).toBe(203)
      
      const bodyGET = await resGET.json()
      const bodyPOST = await resPOST.json()
      
      expect(bodyGET).toEqual({ method: 'GET' })
      expect(bodyPOST).toEqual({ method: 'POST' })
    })

    it('应该处理复杂的参数验证场景', async () => {
      const handler = createHandler(
        async (req: any, params: any) => ({ id: params.id }),
        { hasParams: true, requireAuth: false }
      )
      
      // 测试各种无效参数
      const invalidParams = [
        { id: '0' },        // 0 不是正数
        { id: '-1' },       // 负数
        { id: 'abc' },      // 非数字字符串
        { id: 'xyz' },      // 另一个非数字字符串
        { id: 'abc123' }    // 以字母开头的字符串（parseInt 返回 NaN）
      ]
      
      for (const params of invalidParams) {
        const res = await handler(new MockRequest('GET') as any, params)
        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.message).toBe('Invalid parameters')
      }
    })

    it('应该处理权限检查失败的情况', async () => {
      vi.mocked(checkPermission).mockResolvedValue(NextResponse.json({ error: '权限检查失败' }, { status: 403 }))
      
      const handler = createHandler(async () => ({ ok: true }), { permission: 'admin:write' })
      const res = await handler(new MockRequest('GET') as any)
      
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toBe('权限检查失败')
    })

    it('应该处理认证失败的情况', async () => {
      vi.mocked(getUserIdFromHeaders).mockReturnValue(null)
      
      const handler = createHandler(async () => ({ ok: true }))
      const res = await handler(new MockRequest('GET') as any)
      
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.message).toBe('Authentication required')
    })

    it('应该处理参数验证失败的情况（多个处理器）', async () => {
      const handlers: Handlers = {
        GET: async (req: any, params: any) => ({ id: params.id }),
        POST: async (req: any, params: any) => ({ id: params.id })
      }
      
      const handler = createHandler(handlers, { hasParams: true, requireAuth: false })
      
      const resGET = await handler(new MockRequest('GET') as any, { id: '0' })
      const resPOST = await handler(new MockRequest('POST') as any, { id: '-1' })
      
      expect(resGET.status).toBe(400)
      expect(resPOST.status).toBe(400)
      
      const bodyGET = await resGET.json()
      const bodyPOST = await resPOST.json()
      
      expect(bodyGET.message).toBe('Invalid parameters')
      expect(bodyPOST.message).toBe('Invalid parameters')
    })

    it('应该处理处理器不支持参数的情况（多个处理器）', async () => {
      const handlers: Handlers = {
        GET: async (req: any) => ({ method: 'GET' }),
        POST: async (req: any) => ({ method: 'POST' })
      }
      
      const handler = createHandler(handlers, { hasParams: true, requireAuth: false })
      
      const resGET = await handler(new MockRequest('GET') as any, { id: '123' })
      const resPOST = await handler(new MockRequest('POST') as any, { id: '456' })
      
      expect(resGET.status).toBe(500)
      expect(resPOST.status).toBe(500)
      
      const bodyGET = await resGET.json()
      const bodyPOST = await resPOST.json()
      
      expect(bodyGET.message).toBe('Handler does not support parameters')
      expect(bodyPOST.message).toBe('Handler does not support parameters')
    })

    it('应该处理异常情况下的错误包装', async () => {
      const handlers: Handlers = {
        GET: async () => { throw new Error('GET 异常') },
        POST: async () => { throw new Error('POST 异常') }
      }
      
      const handler = createHandler(handlers, { requireAuth: false })
      
      const resGET = await handler(new MockRequest('GET') as any)
      const resPOST = await handler(new MockRequest('POST') as any)
      
      expect(resGET.status).toBe(500)
      expect(resPOST.status).toBe(500)
      
      const bodyGET = await resGET.json()
      const bodyPOST = await resPOST.json()
      
      expect(bodyGET.message).toBe('GET 异常')
      expect(bodyPOST.message).toBe('POST 异常')
    })

    it('应该处理参数验证的边界值', async () => {
      const handler = createHandler(
        async (req: any, params: any) => ({ id: params.id }),
        { hasParams: true, requireAuth: false }
      )
      
      // 测试边界值
      const boundaryParams = [
        { id: '1' },           // 最小值
        { id: '999999999' },   // 大数字
        { id: '2147483647' }   // 32位整数最大值
      ]
      
      for (const params of boundaryParams) {
        const res = await handler(new MockRequest('GET') as any, params)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.data.id).toBe(params.id)
      }
    })
  })


})

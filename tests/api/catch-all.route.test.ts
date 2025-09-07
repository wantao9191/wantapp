import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PUT, PATCH, DELETE } from '../../src/app/api/[...all]/route'

// Mock response utilities
vi.mock('../../src/app/api/_utils/response', () => ({
  notFound: vi.fn(() => ({
    status: 404,
    headers: new Map([['Content-Type', 'application/json']]),
    json: () => Promise.resolve({
      code: 404,
      message: 'Not Found',
      data: null
    })
  }))
}))

describe('Catch-all API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/[...all]', () => {
    it('应该返回404响应', async () => {
      const { notFound } = await import('../../src/app/api/_utils/response')
      
      const response = await GET()
      
      expect(notFound).toHaveBeenCalled()
      expect(response.status).toBe(404)
    })

    it('应该返回JSON格式的404错误', async () => {
      const response = await GET()
      const data = await response.json()
      
      expect(data).toEqual({
        code: 404,
        message: 'Not Found',
        data: null
      })
    })
  })

  describe('POST /api/[...all]', () => {
    it('应该返回404响应', async () => {
      const { notFound } = await import('../../src/app/api/_utils/response')
      
      const response = await POST()
      
      expect(notFound).toHaveBeenCalled()
      expect(response.status).toBe(404)
    })

    it('应该返回JSON格式的404错误', async () => {
      const response = await POST()
      const data = await response.json()
      
      expect(data).toEqual({
        code: 404,
        message: 'Not Found',
        data: null
      })
    })
  })

  describe('PUT /api/[...all]', () => {
    it('应该返回404响应', async () => {
      const { notFound } = await import('../../src/app/api/_utils/response')
      
      const response = await PUT()
      
      expect(notFound).toHaveBeenCalled()
      expect(response.status).toBe(404)
    })

    it('应该返回JSON格式的404错误', async () => {
      const response = await PUT()
      const data = await response.json()
      
      expect(data).toEqual({
        code: 404,
        message: 'Not Found',
        data: null
      })
    })
  })

  describe('PATCH /api/[...all]', () => {
    it('应该返回404响应', async () => {
      const { notFound } = await import('../../src/app/api/_utils/response')
      
      const response = await PATCH()
      
      expect(notFound).toHaveBeenCalled()
      expect(response.status).toBe(404)
    })

    it('应该返回JSON格式的404错误', async () => {
      const response = await PATCH()
      const data = await response.json()
      
      expect(data).toEqual({
        code: 404,
        message: 'Not Found',
        data: null
      })
    })
  })

  describe('DELETE /api/[...all]', () => {
    it('应该返回404响应', async () => {
      const { notFound } = await import('../../src/app/api/_utils/response')
      
      const response = await DELETE()
      
      expect(notFound).toHaveBeenCalled()
      expect(response.status).toBe(404)
    })

    it('应该返回JSON格式的404错误', async () => {
      const response = await DELETE()
      const data = await response.json()
      
      expect(data).toEqual({
        code: 404,
        message: 'Not Found',
        data: null
      })
    })
  })

  describe('HTTP方法一致性', () => {
    it('所有HTTP方法应该返回相同的404响应', async () => {
      const getResponse = await GET()
      const postResponse = await POST()
      const putResponse = await PUT()
      const patchResponse = await PATCH()
      const deleteResponse = await DELETE()

      const getData = await getResponse.json()
      const postData = await postResponse.json()
      const putData = await putResponse.json()
      const patchData = await patchResponse.json()
      const deleteData = await deleteResponse.json()

      expect(getData).toEqual(postData)
      expect(postData).toEqual(putData)
      expect(putData).toEqual(patchData)
      expect(patchData).toEqual(deleteData)
    })

    it('所有HTTP方法应该返回相同的状态码', async () => {
      const responses = await Promise.all([
        GET(),
        POST(),
        PUT(),
        PATCH(),
        DELETE()
      ])

      responses.forEach(response => {
        expect(response.status).toBe(404)
      })
    })

    it('所有HTTP方法应该返回JSON内容类型', async () => {
      const responses = await Promise.all([
        GET(),
        POST(),
        PUT(),
        PATCH(),
        DELETE()
      ])

      responses.forEach(response => {
        expect(response.headers.get('Content-Type')).toBe('application/json')
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理notFound函数抛出的错误', async () => {
      const { notFound } = await import('../../src/app/api/_utils/response')
      
      // 重置mock并设置抛出错误
      vi.clearAllMocks()
      vi.mocked(notFound).mockImplementation(() => {
        throw new Error('Response error')
      })

      expect(() => GET()).toThrow('Response error')
    })

    it('应该确保notFound被正确调用', async () => {
      const { notFound } = await import('../../src/app/api/_utils/response')
      
      // 重置mock并设置正常返回
      vi.clearAllMocks()
      vi.mocked(notFound).mockReturnValue({
        status: 404,
        headers: new Map([['Content-Type', 'application/json']]),
        json: () => Promise.resolve({
          code: 404,
          message: 'Not Found',
          data: null
        })
      } as any)
      
      await GET()
      await POST()
      await PUT()
      await PATCH()
      await DELETE()
      
      expect(notFound).toHaveBeenCalledTimes(5)
    })
  })
})
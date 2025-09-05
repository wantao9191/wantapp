import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../../src/app/api/dicts/route'

// Mock database
vi.mock('../../src/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([]))
      }))
    }))
  }
}))

vi.mock('../../src/db/schema', () => ({
  dicts: {
    code: 'code'
  }
}))

// Mock createHandler to return the handler directly
vi.mock('../../src/app/api/_utils/handler', () => ({
  createHandler: vi.fn((handler, options) => handler)
}))

describe('Dicts API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/dicts', () => {
    it('应该根据code参数查询字典数据', async () => {
      const { db } = await import('../../src/db')
      const mockDictData = [
        { id: 1, code: 'status', name: '状态', value: '1', label: '启用' },
        { id: 2, code: 'status', name: '状态', value: '0', label: '禁用' }
      ]

      const whereMock = vi.fn(() => Promise.resolve(mockDictData))
      const fromMock = vi.fn(() => ({ where: whereMock }))
      const selectMock = vi.fn(() => ({ from: fromMock }))
      
      vi.mocked(db.select).mockImplementation(selectMock)

      const request = new NextRequest('http://localhost:3000/api/dicts?code=status')
      const response = await GET(request)

      expect(selectMock).toHaveBeenCalled()
      expect(fromMock).toHaveBeenCalled()
      expect(whereMock).toHaveBeenCalled()
      expect(response).toEqual(mockDictData)
    })

    it('应该处理空的code参数', async () => {
      const { db } = await import('../../src/db')
      const selectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([]))
        }))
      }
      vi.mocked(db.select).mockReturnValue(selectMock as any)

      const request = new NextRequest('http://localhost:3000/api/dicts')
      const response = await GET(request)

      expect(response).toEqual([])
    })

    it('应该处理不存在的字典代码', async () => {
      const { db } = await import('../../src/db')
      const selectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([]))
        }))
      }
      vi.mocked(db.select).mockReturnValue(selectMock as any)

      const request = new NextRequest('http://localhost:3000/api/dicts?code=nonexistent')
      const response = await GET(request)

      expect(response).toEqual([])
    })

    it('应该处理多个字典项', async () => {
      const { db } = await import('../../src/db')
      const mockDictData = [
        { id: 1, code: 'gender', name: '性别', value: 'male', label: '男' },
        { id: 2, code: 'gender', name: '性别', value: 'female', label: '女' },
        { id: 3, code: 'gender', name: '性别', value: 'other', label: '其他' }
      ]

      const selectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve(mockDictData))
        }))
      }
      vi.mocked(db.select).mockReturnValue(selectMock as any)

      const request = new NextRequest('http://localhost:3000/api/dicts?code=gender')
      const response = await GET(request)

      expect(response).toEqual(mockDictData)
      expect(response).toHaveLength(3)
    })

    it('应该处理特殊字符的code参数', async () => {
      const { db } = await import('../../src/db')
      const selectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([]))
        }))
      }
      vi.mocked(db.select).mockReturnValue(selectMock as any)

      const request = new NextRequest('http://localhost:3000/api/dicts?code=user-status')
      const response = await GET(request)

      expect(response).toEqual([])
    })

    it('应该处理URL编码的参数', async () => {
      const { db } = await import('../../src/db')
      const selectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([]))
        }))
      }
      vi.mocked(db.select).mockReturnValue(selectMock as any)

      const request = new NextRequest('http://localhost:3000/api/dicts?code=%E7%8A%B6%E6%80%81') // "状态" URL编码
      const response = await GET(request)

      expect(response).toEqual([])
    })

    it('应该处理数据库查询错误', async () => {
      const { db } = await import('../../src/db')
      const selectMock = {
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.reject(new Error('Database error')))
        }))
      }
      vi.mocked(db.select).mockReturnValue(selectMock as any)

      const request = new NextRequest('http://localhost:3000/api/dicts?code=status')
      
      await expect(GET(request)).rejects.toThrow('Database error')
    })

    it('应该使用正确的查询条件', async () => {
      const { db } = await import('../../src/db')
      const { dicts } = await import('../../src/db/schema')
      
      const whereMock = vi.fn(() => Promise.resolve([]))
      const fromMock = vi.fn(() => ({ where: whereMock }))
      const selectMock = vi.fn(() => ({ from: fromMock }))
      
      vi.mocked(db.select).mockImplementation(selectMock)

      const request = new NextRequest('http://localhost:3000/api/dicts?code=test-code')
      await GET(request)

      expect(selectMock).toHaveBeenCalled()
      expect(fromMock).toHaveBeenCalledWith(dicts)
    })
  })
})
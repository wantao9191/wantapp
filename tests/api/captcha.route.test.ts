import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../../src/app/api/captcha/route'

// Mock dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    set: vi.fn()
  }))
}))

vi.mock('../../src/lib/utils', () => ({
  generateRandomString: vi.fn(() => 'mock-random-string')
}))

vi.mock('../../src/lib/crypto', () => ({
  encryptJson: vi.fn(() => Promise.resolve('encrypted-data'))
}))

describe('Captcha API', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    vi.clearAllMocks()
    mockRequest = new NextRequest('http://localhost:3000/api/captcha')
    
    // Mock Math.random to return predictable values
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    vi.spyOn(Date, 'now').mockReturnValue(1000000000)
  })

  describe('GET /api/captcha', () => {
    it('应该生成验证码SVG图片', async () => {
      const response = await GET(mockRequest)
      
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('image/svg+xml')
      expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate')
      expect(response.headers.get('X-Captcha-Id')).toBe('mock-random-string')
    })

    it('应该生成4位数字验证码', async () => {
      const response = await GET(mockRequest)
      const svgContent = await response.text()
      
      // 验证SVG包含4位数字（基于Math.random = 0.5的预期结果）
      const expectedCode = Math.floor(1000 + 0.5 * 9000).toString()
      expect(svgContent).toContain(expectedCode)
    })

    it('应该设置验证码cookie', async () => {
      const { cookies } = await import('next/headers')
      const { encryptJson } = await import('../../src/lib/crypto')
      
      await GET(mockRequest)
      
      expect(encryptJson).toHaveBeenCalledWith({
        id: 'mock-random-string',
        code: expect.any(String),
        expires: expect.any(Number)
      })
      
      expect(cookies).toHaveBeenCalled()
    })

    it('应该生成包含干扰元素的SVG', async () => {
      const response = await GET(mockRequest)
      const svgContent = await response.text()
      
      expect(svgContent).toContain('<svg')
      expect(svgContent).toContain('<line') // 干扰线
      expect(svgContent).toContain('<circle') // 干扰点
      expect(svgContent).toContain('linearGradient') // 背景渐变
    })

    it('应该设置正确的响应头', async () => {
      const response = await GET(mockRequest)
      
      expect(response.headers.get('Pragma')).toBe('no-cache')
      expect(response.headers.get('Expires')).toBe('0')
      expect(response.headers.get('X-Captcha-Id')).toBeTruthy()
    })

    it('应该处理加密失败的情况', async () => {
      const { encryptJson } = await import('../../src/lib/crypto')
      vi.mocked(encryptJson).mockRejectedValue(new Error('Encryption failed'))
      
      const response = await GET(mockRequest)
      
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to generate captcha')
    })

    it('应该生成不同的验证码', async () => {
      // 重置mock，确保每次调用都成功
      const { encryptJson } = await import('../../src/lib/crypto')
      vi.mocked(encryptJson).mockResolvedValue('encrypted-data')
      
      // 第一次调用
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.1)
      const response1 = await GET(mockRequest)
      const svg1 = await response1.text()
      
      // 第二次调用
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.9)
      const response2 = await GET(mockRequest)
      const svg2 = await response2.text()
      
      expect(svg1).not.toBe(svg2)
    })

    it('应该设置正确的cookie选项', async () => {
      // 重置所有mock
      vi.clearAllMocks()
      
      const { cookies } = await import('next/headers')
      const { encryptJson } = await import('../../src/lib/crypto')
      
      const mockCookieStore = {
        set: vi.fn()
      }
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
      vi.mocked(encryptJson).mockResolvedValue('encrypted-data')
      
      await GET(mockRequest)
      
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'captcha',
        'encrypted-data',
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 1000 * 60 * 5, // 5分钟
          path: '/',
        }
      )
    })
  })
})
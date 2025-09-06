import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock HTTP客户端类，用于测试token刷新机制
class TokenRefreshHttpClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private refreshInProgress: Promise<void> | null = null

  constructor(accessToken?: string, refreshToken?: string) {
    this.accessToken = accessToken || null
    this.refreshToken = refreshToken || null
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  getRefreshToken(): string | null {
    return this.refreshToken
  }

  async request(url: string, options: RequestInit = {}): Promise<Response> {
    // 添加Authorization头
    const headers = new Headers(options.headers)
    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`)
    }

    // 模拟API请求
    const response = await this.mockApiCall(url, { ...options, headers })

    // 如果收到401错误且有refresh token，尝试刷新
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.handleTokenRefresh()
      if (refreshed) {
        // 重试原始请求
        const newHeaders = new Headers(options.headers)
        if (this.accessToken) {
          newHeaders.set('Authorization', `Bearer ${this.accessToken}`)
        }
        return this.mockApiCall(url, { ...options, headers: newHeaders })
      }
    }

    return response
  }

  private async mockApiCall(url: string, options: RequestInit): Promise<Response> {
    const authHeader = options.headers?.get?.('Authorization')

    // 模拟不同的API响应
    if (url.includes('/protected')) {
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      }
      
      if (authHeader.includes('expired-token')) {
        return new Response(JSON.stringify({ error: 'Token expired' }), { status: 401 })
      }
      
      return new Response(JSON.stringify({ data: 'Protected data' }), { status: 200 })
    }

    if (url.includes('/auth/refresh')) {
      const body = options.body ? JSON.parse(options.body.toString()) : {}
      const { refreshToken } = body

      if (refreshToken === 'valid-refresh-token') {
        return new Response(JSON.stringify({
          code: 200,
          data: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
            userInfo: { id: 1, username: 'testuser' }
          }
        }), { status: 200 })
      }

      if (refreshToken === 'expired-refresh-token') {
        return new Response(JSON.stringify({
          code: 500,
          message: '刷新令牌无效或已过期'
        }), { status: 500 })
      }
    }

    return new Response(JSON.stringify({ data: 'Success' }), { status: 200 })
  }

  private async handleTokenRefresh(): Promise<boolean> {
    // 防止并发刷新
    if (this.refreshInProgress) {
      await this.refreshInProgress
      return this.accessToken !== null
    }

    this.refreshInProgress = this.performTokenRefresh()
    
    try {
      await this.refreshInProgress
      return this.accessToken !== null
    } catch (error) {
      // 刷新失败，返回false但不抛出错误
      return false
    } finally {
      this.refreshInProgress = null
    }
  }

  private async performTokenRefresh(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await this.mockApiCall('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.code === 200) {
          this.accessToken = result.data.accessToken
          this.refreshToken = result.data.refreshToken
        } else {
          this.clearTokens()
          throw new Error(result.message || 'Token refresh failed')
        }
      } else {
        this.clearTokens()
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      this.clearTokens()
      throw error
    }
  }

  private clearTokens() {
    this.accessToken = null
    this.refreshToken = null
  }
}

describe('HTTP Token刷新机制测试', () => {
  let httpClient: TokenRefreshHttpClient

  beforeEach(() => {
    httpClient = new TokenRefreshHttpClient()
  })

  describe('基本token刷新功能', () => {
    it('应该在访问token过期时自动刷新', async () => {
      // Arrange
      httpClient.setTokens('expired-token', 'valid-refresh-token')

      // Act
      const response = await httpClient.request('/protected')
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(result.data).toBe('Protected data')
      expect(httpClient.getAccessToken()).toBe('new-access-token')
      expect(httpClient.getRefreshToken()).toBe('new-refresh-token')
    })

    it('应该在没有访问token时直接返回401', async () => {
      // Act
      const response = await httpClient.request('/protected')

      // Assert
      expect(response.status).toBe(401)
      expect(httpClient.getAccessToken()).toBeNull()
      expect(httpClient.getRefreshToken()).toBeNull()
    })

    it('应该在刷新token无效时清除所有token', async () => {
      // Arrange
      httpClient.setTokens('expired-token', 'expired-refresh-token')

      // Act
      const response = await httpClient.request('/protected')

      // Assert
      expect(response.status).toBe(401)
      expect(httpClient.getAccessToken()).toBeNull()
      expect(httpClient.getRefreshToken()).toBeNull()
    })

    it('应该在有效访问token时正常请求', async () => {
      // Arrange
      httpClient.setTokens('valid-access-token', 'valid-refresh-token')

      // Act
      const response = await httpClient.request('/protected')
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(result.data).toBe('Protected data')
      expect(httpClient.getAccessToken()).toBe('valid-access-token') // Token未改变
      expect(httpClient.getRefreshToken()).toBe('valid-refresh-token') // Token未改变
    })
  })

  describe('并发请求处理', () => {
    it('应该防止并发刷新请求', async () => {
      // Arrange
      httpClient.setTokens('expired-token', 'valid-refresh-token')
      
      // 监控刷新调用次数
      const originalPerformRefresh = httpClient['performTokenRefresh']
      let refreshCallCount = 0
      
      httpClient['performTokenRefresh'] = async function() {
        refreshCallCount++
        // 添加延迟模拟网络请求
        await new Promise(resolve => setTimeout(resolve, 10))
        return originalPerformRefresh.call(this)
      }

      // Act - 发起多个并发请求
      const promises = [
        httpClient.request('/protected'),
        httpClient.request('/protected'),
        httpClient.request('/protected')
      ]
      
      const responses = await Promise.all(promises)

      // Assert
      expect(refreshCallCount).toBe(1) // 只应该有一次刷新调用
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
      expect(httpClient.getAccessToken()).toBe('new-access-token')
    })
  })

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      // Arrange
      httpClient.setTokens('expired-token', 'valid-refresh-token')
      
      // Mock网络错误
      const originalMockApiCall = httpClient['mockApiCall']
      httpClient['mockApiCall'] = async function(url: string, options: RequestInit) {
        if (url.includes('/auth/refresh')) {
          throw new Error('Network error')
        }
        return originalMockApiCall.call(this, url, options)
      }

      // Act
      const response = await httpClient.request('/protected')

      // Assert
      expect(response.status).toBe(401)
      expect(httpClient.getAccessToken()).toBeNull()
      expect(httpClient.getRefreshToken()).toBeNull()
    })

    it('应该处理刷新API返回的错误响应', async () => {
      // Arrange
      httpClient.setTokens('expired-token', 'invalid-refresh-token')

      // Act
      const response = await httpClient.request('/protected')

      // Assert
      expect(response.status).toBe(401)
      expect(httpClient.getAccessToken()).toBeNull()
      expect(httpClient.getRefreshToken()).toBeNull()
    })
  })

  describe('Token生命周期管理', () => {
    it('应该正确更新token对', async () => {
      // Arrange
      const initialAccessToken = 'initial-access-token'
      const initialRefreshToken = 'valid-refresh-token'
      httpClient.setTokens(initialAccessToken, initialRefreshToken)

      // 模拟过期的访问token
      httpClient.setTokens('expired-token', initialRefreshToken)

      // Act
      await httpClient.request('/protected')

      // Assert
      expect(httpClient.getAccessToken()).toBe('new-access-token')
      expect(httpClient.getRefreshToken()).toBe('new-refresh-token')
      expect(httpClient.getAccessToken()).not.toBe(initialAccessToken)
      expect(httpClient.getRefreshToken()).not.toBe(initialRefreshToken)
    })

    it('应该在刷新失败后清除所有token', async () => {
      // Arrange
      httpClient.setTokens('expired-token', 'expired-refresh-token')

      // Act
      await httpClient.request('/protected')

      // Assert
      expect(httpClient.getAccessToken()).toBeNull()
      expect(httpClient.getRefreshToken()).toBeNull()
    })
  })

  describe('安全性测试', () => {
    it('应该在请求中正确设置Authorization头', async () => {
      // Arrange
      const testToken = 'test-access-token'
      httpClient.setTokens(testToken, 'valid-refresh-token')
      
      // Mock API调用以检查头部
      let capturedHeaders: Headers | null = null
      const originalMockApiCall = httpClient['mockApiCall']
      httpClient['mockApiCall'] = async function(url: string, options: RequestInit) {
        capturedHeaders = options.headers as Headers
        return originalMockApiCall.call(this, url, options)
      }

      // Act
      await httpClient.request('/protected')

      // Assert
      expect(capturedHeaders?.get('Authorization')).toBe(`Bearer ${testToken}`)
    })

    it('应该在没有token时不设置Authorization头', async () => {
      // Arrange - 没有设置token
      
      // Mock API调用以检查头部
      let capturedHeaders: Headers | null = null
      const originalMockApiCall = httpClient['mockApiCall']
      httpClient['mockApiCall'] = async function(url: string, options: RequestInit) {
        capturedHeaders = options.headers as Headers
        return originalMockApiCall.call(this, url, options)
      }

      // Act
      await httpClient.request('/protected')

      // Assert
      expect(capturedHeaders?.get('Authorization')).toBeNull()
    })
  })

  describe('重试机制', () => {
    it('应该在token刷新后重试原始请求', async () => {
      // Arrange
      httpClient.setTokens('expired-token', 'valid-refresh-token')
      
      // 跟踪API调用
      const apiCalls: string[] = []
      const originalMockApiCall = httpClient['mockApiCall']
      httpClient['mockApiCall'] = async function(url: string, options: RequestInit) {
        apiCalls.push(url)
        return originalMockApiCall.call(this, url, options)
      }

      // Act
      const response = await httpClient.request('/protected')

      // Assert
      expect(response.status).toBe(200)
      expect(apiCalls).toContain('/protected') // 原始请求
      expect(apiCalls).toContain('/auth/refresh') // 刷新请求
      expect(apiCalls.filter(url => url === '/protected')).toHaveLength(2) // 重试请求
    })

    it('应该只重试一次', async () => {
      // Arrange
      httpClient.setTokens('expired-token', 'valid-refresh-token')
      
      // Mock刷新后仍然返回过期token
      const originalMockApiCall = httpClient['mockApiCall']
      let refreshCount = 0
      httpClient['mockApiCall'] = async function(url: string, options: RequestInit) {
        if (url.includes('/auth/refresh')) {
          refreshCount++
          return new Response(JSON.stringify({
            code: 200,
            data: {
              accessToken: 'still-expired-token',
              refreshToken: 'new-refresh-token',
              userInfo: { id: 1, username: 'testuser' }
            }
          }), { status: 200 })
        }
        
        if (url.includes('/protected')) {
          const authHeader = options.headers?.get?.('Authorization')
          if (authHeader?.includes('still-expired-token')) {
            return new Response(JSON.stringify({ error: 'Token still expired' }), { status: 401 })
          }
        }
        
        return originalMockApiCall.call(this, url, options)
      }

      // Act
      const response = await httpClient.request('/protected')

      // Assert
      expect(response.status).toBe(401) // 最终仍然失败
      expect(refreshCount).toBe(1) // 只刷新了一次
    })
  })
})
import Cookies from 'js-cookie'

export class TokenManager {
  private static ACCESS_TOKEN_KEY = 'access_token'
  private static REFRESH_TOKEN_KEY = 'refresh_token'

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return Cookies.get(TokenManager.ACCESS_TOKEN_KEY) || null
    }
    return null
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return Cookies.get(TokenManager.REFRESH_TOKEN_KEY) || null
    }
    return null
  }

  setToken(token: string, persistent: boolean = true): void {
    if (typeof window !== 'undefined') {
      Cookies.set(TokenManager.ACCESS_TOKEN_KEY, token)
    }
  }

  setTokens(
    tokens: { accessToken: string; refreshToken?: string },
    persistent: boolean = true
  ): void {
    this.setToken(tokens.accessToken, persistent)
    if (typeof window !== 'undefined' && tokens.refreshToken) {
      Cookies.set(TokenManager.REFRESH_TOKEN_KEY, tokens.refreshToken)
    }
  }

  clearToken(): void {
    if (typeof window !== 'undefined') {
      Cookies.remove(TokenManager.ACCESS_TOKEN_KEY)
      Cookies.remove(TokenManager.REFRESH_TOKEN_KEY)
    }
  }

  toLogin(): void {
    if (typeof window !== 'undefined') {
      this.clearToken()
      localStorage.removeItem('userInfo')
      sessionStorage.clear()
      const pathname = window.location.pathname
      if (pathname.includes('/admin/login')) {
        return
      }
      window.location.href = `/admin/login?redirect=${encodeURIComponent(pathname)}`
    }
  }

  async refreshAccessToken(baseURL: string): Promise<{ success: boolean; reason?: string }> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      return { success: false, reason: 'no_refresh_token' }
    }

    try {
      const res = await fetch(`${baseURL}/admin/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      })

      const data = await res.json()

      if (res.ok && data?.data) {
        const { accessToken, refreshToken: newRefreshToken } = data.data
        this.setTokens({ accessToken, refreshToken: newRefreshToken }, true)
        return { success: true }
      } else {
        return { success: false, reason: 'refresh_token_invalid' }
      }
    } catch (error) {
      console.error('刷新令牌失败:', error)
      return { success: false, reason: 'network_error' }
    }
  }
}
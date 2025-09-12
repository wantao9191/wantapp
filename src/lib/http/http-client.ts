import { TokenManager } from './token-manager'
import { HttpErrorHandler, HttpError } from './http-error-handler'
import { ResponseHandler } from './response-handler'

export interface RequestConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  withCredentials?: boolean
  showTimeoutWarning?: boolean
  showMessage?: boolean
  messageDuration?: number
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  timeout?: number
  withCredentials?: boolean
}

export class HttpClient {
  private config: RequestConfig
  private baseURL: string
  private tokenManager: TokenManager
  private errorHandler: HttpErrorHandler
  private responseHandler: ResponseHandler

  constructor(config: RequestConfig = {}) {
    this.config = {
      baseURL: config.baseURL || '/api',
      timeout: config.timeout || 20000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      withCredentials: config.withCredentials ?? true,
      showTimeoutWarning: config.showTimeoutWarning ?? true,
      showMessage: config.showMessage ?? true,
      messageDuration: config.messageDuration || 3000,
    }
    this.baseURL = this.config.baseURL!
    
    this.tokenManager = new TokenManager()
    this.errorHandler = new HttpErrorHandler(this.config.showMessage, this.config.messageDuration)
    this.responseHandler = new ResponseHandler(this.errorHandler)
  }

  private buildQueryString(data: any): string {
    if (!data || typeof data !== 'object') return ''

    const params = new URLSearchParams()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, String(item)))
        } else {
          params.append(key, String(value))
        }
      }
    })

    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  private async buildRequestOptions(options: RequestOptions, data?: any): Promise<RequestInit> {
    const token = this.tokenManager.getToken()

    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        ...this.config.headers,
        ...options.headers,
      },
      credentials: options.withCredentials !== false ? 'include' : 'omit',
    }

    if (token) {
      requestOptions.headers = {
        ...requestOptions.headers,
        'Authorization': `Bearer ${token}`,
      }
    }

    if (data && ['POST', 'PUT', 'PATCH'].includes(options.method || 'GET')) {
      if (data instanceof FormData) {
        requestOptions.body = data
        const headers = requestOptions.headers as Record<string, string>
        delete headers['Content-Type']
      } else {
        requestOptions.body = JSON.stringify(data)
      }
    }

    return requestOptions
  }

  private showTimeoutWarning(url: string, remainingSeconds: number): void {
    if (typeof window !== 'undefined') {
      console.warn(`⚠️ 请求即将超时 - URL: ${url}, 剩余时间: ${remainingSeconds}秒`)
      this.errorHandler.showErrorMessage('warning', `请求即将超时，剩余时间：${remainingSeconds}秒`)

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('请求即将超时', {
          body: `URL: ${url}\n剩余时间: ${remainingSeconds}秒`,
          icon: '⚠️',
          tag: 'timeout-warning'
        })
      }
    }
  }

  public configureMessage(options: { showMessage?: boolean; messageDuration?: number; messageApi?: any }): void {
    this.errorHandler.updateConfig(options)
    if (options.showMessage !== undefined) {
      this.config.showMessage = options.showMessage
    }
    if (options.messageDuration !== undefined) {
      this.config.messageDuration = options.messageDuration
    }
  }

  public setMessageApi(messageApi: any): void {
    this.errorHandler.setMessageApi(messageApi)
  }

  // Token management methods
  public setToken(token: string, persistent: boolean = true): void {
    this.tokenManager.setToken(token, persistent)
  }

  public setTokens(tokens: { accessToken: string; refreshToken?: string }, persistent: boolean = true): void {
    this.tokenManager.setTokens(tokens, persistent)
  }

  public clearToken(): void {
    this.tokenManager.clearToken()
  }

  // Main request method
  public async request<T = any>(url: string, options: RequestOptions = {}, data?: any): Promise<ApiResponse<T>> {
    return this.requestInternal<T>(url, options, data, false)
  }

  private async requestInternal<T = any>(
    url: string,
    options: RequestOptions = {},
    data?: any,
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    let fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`

    if (options.method === 'GET' && data) {
      const queryString = this.buildQueryString(data)
      if (queryString) {
        fullURL += queryString
      }
    }

    try {
      const controller = new AbortController()
      const timeout: number = options.timeout || this.config.timeout || 10000
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const warningTimeout = Math.max(timeout - 1000, 1000)
      const warningId = setTimeout(() => {
        if (typeof window !== 'undefined' && this.config?.showTimeoutWarning) {
          this.showTimeoutWarning(url, 1)
        }
      }, warningTimeout)

      const requestOptions = await this.buildRequestOptions(options, data)
      requestOptions.signal = controller.signal

      const response = await fetch(fullURL, requestOptions)
      clearTimeout(timeoutId)
      clearTimeout(warningId)

      // Handle 401 errors
      if (response.status === 401 && !isRetry) {
        const isTokenExpired = await this.errorHandler.isTokenExpiredError(response)
        if (isTokenExpired) {
          const refreshResult = await this.tokenManager.refreshAccessToken(this.baseURL)
          if (refreshResult.success) {
            return this.requestInternal<T>(url, options, data, true)
          } else {
            this.errorHandler.showErrorMessage('error', '登录已过期，请重新登录')
            this.tokenManager.toLogin()
          }
        } else {
          this.errorHandler.showErrorMessage('error', '认证失败，请重新登录')
          this.tokenManager.toLogin()
        }
      }

      // Handle business-level 401 errors
      try {
        const contentType = response.headers.get('content-type')
        if (!isRetry && response.ok && contentType?.includes('application/json')) {
          const cloned = response.clone()
          const body = await cloned.json()
          if (typeof body?.code === 'number' && body.code === 401) {
            const isTokenExpired = this.errorHandler.isTokenExpiredFromBody(body)
            if (isTokenExpired) {
              const refreshResult = await this.tokenManager.refreshAccessToken(this.baseURL)
              if (refreshResult.success) {
                return this.requestInternal<T>(url, options, data, true)
              } else {
                this.errorHandler.showErrorMessage('error', '登录已过期，请重新登录')
                this.tokenManager.toLogin()
              }
            } else {
              this.errorHandler.showErrorMessage('error', '认证失败，请重新登录')
              this.tokenManager.toLogin()
            }
          }
        }
      } catch { }

      return this.responseHandler.handleResponse(response)
    } catch (error: any) {
      return this.errorHandler.handleError(error, options.timeout || this.config.timeout)
    }
  }

  // HTTP method shortcuts
  public async get<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' }, data)
  }

  public async post<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST' }, data)
  }

  public async put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT' }, data)
  }

  public async delete<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }

  public async patch<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PATCH' }, data)
  }

  public async upload<T = any>(url: string, file: File, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    return this.request<T>(url, { ...options, method: 'POST' }, formData)
  }

  public async download(url: string, filename?: string, options: RequestOptions = {}): Promise<void> {
    const response = await this.request(url, { ...options, method: 'GET' })

    if (response.data instanceof Blob) {
      const blob = response.data
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      return
    }
    throw new HttpError('下载失败：响应非二进制数据', -4, response.data)
  }
}

// Create default instance
export const http = new HttpClient()
export default HttpClient
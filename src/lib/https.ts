import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
import { message } from 'antd'
// HTTP请求封装类
export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  showTimeoutWarning?: boolean; // 是否显示超时警告
  showMessage?: boolean; // 是否显示消息提示
  messageDuration?: number; // 消息显示时长（毫秒）
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 自定义错误类型：用于在请求失败时抛出，包含 code 与后端返回的数据
class HttpError extends Error {
  public code: number
  public data: any

  constructor(message: string, code: number, data?: any) {
    super(message)
    this.name = 'HttpError'
    this.code = code
    this.data = data ?? null
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
}

class HttpRequest {
  private config: RequestConfig;
  private baseURL: string;
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refreshToken';

  constructor(config: RequestConfig = {}) {
    this.config = {
      baseURL: config.baseURL || '/api',
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      withCredentials: config.withCredentials ?? true,
      showTimeoutWarning: config.showTimeoutWarning ?? true, // 默认显示超时警告
      showMessage: config.showMessage ?? true, // 默认显示消息提示
      messageDuration: config.messageDuration || 3000, // 默认3秒
    };
    this.baseURL = this.config.baseURL!;
  }

  // 构建查询字符串
  private buildQueryString(data: any): string {
    if (!data || typeof data !== 'object') return '';
    
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, String(item)));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  // 请求拦截器
  private async requestInterceptor(options: RequestOptions, data?: any): Promise<RequestInit> {
    // 获取token
    const token = this.getToken();

    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        ...this.config.headers,
        ...options.headers,
      },
      credentials: options.withCredentials !== false ? 'include' : 'omit',
    };

    // 添加token到请求头
    if (token) {
      requestOptions.headers = {
        ...requestOptions.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    // 处理请求体
    if (data && ['POST', 'PUT', 'PATCH'].includes(options.method || 'GET')) {
      if (data instanceof FormData) {
        requestOptions.body = data;
        // FormData会自动设置Content-Type，需要删除手动设置的
        const headers = requestOptions.headers as Record<string, string>;
        delete headers['Content-Type'];
      } else {
        requestOptions.body = JSON.stringify(data);
      }
    }

    return requestOptions;
  }

  // 响应拦截器
  private async responseInterceptor(response: Response): Promise<ApiResponse> {
    const contentType = response.headers.get('content-type');

    // 处理不同的响应类型
    if (contentType?.includes('application/json')) {
      const data = await response.json();

      // 遵循后端约定：若存在 code，则以 code === 200 判定成功
      if (typeof data?.code === 'number') {
        const isSuccess = data.code === 200;
        if (isSuccess) {
          return {
            code: data.code,
            message: data.message || '请求成功',
            data: data.data ?? null,
            success: true,
          };
        }
        // 业务失败：显示错误消息并抛出异常
        const errorMsg = data.message || '请求失败';
        this.showMessage('error', errorMsg);
        throw new HttpError(errorMsg, data.code, data.data);
      }

      // 无 code 字段时，回退到 HTTP 状态语义
      if (response.ok) {
        return {
          code: response.status,
          message: data?.message || '请求成功',
          data: data?.data ?? data,
          success: true,
        };
      }
      const errorMsg = data?.message || data?.error || '请求失败';
      this.showMessage('error', errorMsg);
      throw new HttpError(errorMsg, response.status, data?.data ?? data);
    } else if (contentType?.includes('text/')) {
      const text = await response.text();
      if (response.ok) {
        return {
          code: response.status,
          message: '请求成功',
          data: text,
          success: true,
        };
      }
      this.showMessage('error', '请求失败');
      throw new HttpError('请求失败', response.status, text);
    } else {
      // 处理文件下载等二进制数据
      const blob = await response.blob();
      if (response.ok) {
        return {
          code: response.status,
          message: '请求成功',
          data: blob,
          success: true,
        };
      }
      this.showMessage('error', '请求失败');
      throw new HttpError('请求失败', response.status, blob);
    }
  }

  // 错误处理
  private handleError(error: any): never {
    console.error('HTTP请求错误:', error);

    if (error?.name === 'TypeError' && typeof error?.message === 'string' && error.message.includes('fetch')) {
      this.showMessage('error', '网络连接失败，请检查网络设置');
      throw new HttpError('网络连接失败，请检查网络设置', -1);
    }

    if (error?.name === 'AbortError') {
      // 改进超时错误提示，显示具体的超时时间
      const timeout = this.config.timeout || 10000;
      const timeoutSeconds = timeout / 1000;
      const errorMsg = `请求超时（${timeoutSeconds}秒），请检查网络连接或稍后重试`;
      this.showMessage('error', errorMsg);
      throw new HttpError(errorMsg, -2);
    }

    // 已经是业务 HttpError，直接抛出
    if (error instanceof HttpError) {
      this.showMessage('error', error.message);
      throw error;
    }

    const unknownError = error?.message || '未知错误';
    this.showMessage('error', unknownError);
    throw new HttpError(unknownError, -3);
  }

  // 获取token
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return Cookies.get(HttpRequest.ACCESS_TOKEN_KEY) || null
    }
    return null;
  }
  // 异常情况返回登录
  private toLogin() {
    const router = useRouter()
    const pathname = usePathname()
    if (pathname.includes('/admin/login')) {
      return
    }
    router.push(`/admin/login?redirect=${pathname}`)
  }
  // 获取 refresh token
  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return Cookies.get(HttpRequest.REFRESH_TOKEN_KEY) || null
    }
    return null;
  }

  // 设置token
  public setToken(token: string, persistent: boolean = true): void {
    if (typeof window !== 'undefined') {
      if (persistent) {
        Cookies.set(HttpRequest.ACCESS_TOKEN_KEY, token)
      } else {
        Cookies.set(HttpRequest.ACCESS_TOKEN_KEY, token)
      }
    }
  }

  // 设置 access/refresh tokens（推荐使用）
  public setTokens(
    tokens: { accessToken: string; refreshToken?: string },
    persistent: boolean = true
  ): void {
    this.setToken(tokens.accessToken, persistent);
    if (typeof window !== 'undefined' && tokens.refreshToken) {
      if (persistent) {
        Cookies.set(HttpRequest.REFRESH_TOKEN_KEY, tokens.refreshToken)
      } else {
        Cookies.set(HttpRequest.REFRESH_TOKEN_KEY, tokens.refreshToken)
      }
    }
  }

  // 清除token
  public clearToken(): void {
    if (typeof window !== 'undefined') {
      Cookies.remove(HttpRequest.ACCESS_TOKEN_KEY)
      Cookies.remove(HttpRequest.REFRESH_TOKEN_KEY)
    }
  }

  // 配置消息提示
  public configureMessage(options: { showMessage?: boolean; messageDuration?: number }): void {
    if (options.showMessage !== undefined) {
      this.config.showMessage = options.showMessage;
    }
    if (options.messageDuration !== undefined) {
      this.config.messageDuration = options.messageDuration;
    }
  }

  // 显示消息提示
  private showMessage(type: 'success' | 'error' | 'warning' | 'info', content: string): void {
    if (typeof window !== 'undefined' && this.config?.showMessage) {
      message[type](content, (this.config?.messageDuration || 3000) / 1000);
    }
  }

  // 显示超时警告提示
  private showTimeoutWarning(url: string, remainingSeconds: number): void {
    if (typeof window !== 'undefined') {
      // 简化的超时警告提示，只显示在控制台
      console.warn(`⚠️ 请求即将超时 - URL: ${url}, 剩余时间: ${remainingSeconds}秒`);
      
      // 显示消息提示
      this.showMessage('warning', `请求即将超时，剩余时间：${remainingSeconds}秒`);
      
      // 可选：显示一个简单的浏览器通知（如果浏览器支持）
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('请求即将超时', {
          body: `URL: ${url}\n剩余时间: ${remainingSeconds}秒`,
          icon: '⚠️',
          tag: 'timeout-warning'
        });
      }
    }
  }

  // 使用 refresh token 刷新 access token
  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && (data?.data?.accessToken || data?.accessToken)) {
        const accessToken = data.data?.accessToken || data.accessToken;
        this.setToken(accessToken, true);
        return true;
      }
    } catch { }
    return false;
  }

  // 通用请求方法
  public async request<T = any>(
    url: string,
    options: RequestOptions = {},
    data?: any
  ): Promise<ApiResponse<T>> {
    return this.requestInternal<T>(url, options, data, false);
  }

  private async requestInternal<T = any>(
    url: string,
    options: RequestOptions = {},
    data?: any,
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    let fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    // 对于 GET 请求，将数据作为查询参数拼接到 URL 上
    if (options.method === 'GET' && data) {
      const queryString = this.buildQueryString(data);
      if (queryString) {
        fullURL += queryString;
      }
    }

    try {
      const controller = new AbortController();
      const timeout: number = options.timeout || this.config.timeout || 10000;
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // 添加超时前的警告提示（在超时前1秒显示）
      const warningTimeout = Math.max(timeout - 1000, 1000); // 至少1秒
      const warningId = setTimeout(() => {
        if (typeof window !== 'undefined' && this.config?.showTimeoutWarning) {
          console.warn(`⚠️ 请求即将超时，剩余时间：1秒`);
          this.showTimeoutWarning(url, 1);
        }
      }, warningTimeout);

      const requestOptions = await this.requestInterceptor(options, data);
      requestOptions.signal = controller.signal;

      const response = await fetch(fullURL, requestOptions);
      clearTimeout(timeoutId);
      clearTimeout(warningId);

      // 401 处理：尝试刷新一次（基于 HTTP 状态码）
      if (response.status === 401 && !isRetry) {
        // 移除重新请求逻辑，只记录日志
        console.warn('请求返回401状态，需要重新登录');
        this.showMessage('error', '登录已过期，请重新登录');
        // 可以在这里添加跳转登录的逻辑
        // this.toLogin();
      }

      // 若 HTTP 为 200，但后端以业务 code 标识 401（常见于部分网关/后端约定），同样处理
      try {
        const contentType = response.headers.get('content-type');
        if (!isRetry && response.ok && contentType?.includes('application/json')) {
          const cloned = response.clone();
          const body = await cloned.json();
          if (typeof body?.code === 'number' && body.code === 401) {
            console.warn('业务层面返回401状态，需要重新登录');
            this.showMessage('error', '登录已过期，请重新登录');
            // 可以在这里添加跳转登录的逻辑
            // this.toLogin();
          }
        }
      } catch { }

      return this.responseInterceptor(response);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // GET请求
  public async get<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' }, data);
  }

  // POST请求
  public async post<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST' }, data);
  }

  // PUT请求
  public async put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT' }, data);
  }

  // DELETE请求
  public async delete<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  // PATCH请求
  public async patch<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PATCH' }, data);
  }

  // 文件上传
  public async upload<T = any>(url: string, file: File, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<T>(url, { ...options, method: 'POST' }, formData);
  }

  // 文件下载
  public async download(url: string, filename?: string, options: RequestOptions = {}): Promise<void> {
    const response = await this.request(url, { ...options, method: 'GET' });

    if (response.data instanceof Blob) {
      const blob = response.data;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      return;
    }
    throw new HttpError('下载失败：响应非二进制数据', -4, response.data);
  }
}

// 创建默认实例
export const http = new HttpRequest();

// 导出类型
export default HttpRequest;

// 使用示例：
// 
// // 配置消息提示
// http.configureMessage({
//   showMessage: true,        // 启用消息提示
//   messageDuration: 5000     // 消息显示5秒
// });
// 
// // 禁用消息提示
// http.configureMessage({ showMessage: false });
// 
// // 自定义超时时间
// const customHttp = new HttpRequest({
//   timeout: 15000,           // 15秒超时
//   showMessage: true,        // 启用消息提示
//   messageDuration: 4000     // 消息显示4秒
// }); 
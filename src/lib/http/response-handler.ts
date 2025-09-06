import { HttpError, HttpErrorHandler } from './http-error-handler'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

export class ResponseHandler {
  private errorHandler: HttpErrorHandler

  constructor(errorHandler: HttpErrorHandler) {
    this.errorHandler = errorHandler
  }

  async handleResponse(response: Response): Promise<ApiResponse> {
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const data = await response.json()

      if (typeof data?.code === 'number') {
        const isSuccess = data.code === 200
        if (isSuccess) {
          return {
            code: data.code,
            message: data.message || '请求成功',
            data: data.data ?? null,
            success: true,
          }
        }
        const errorMsg = data.message || '请求失败'
        this.errorHandler.showErrorMessage('error', errorMsg)
        throw new HttpError(errorMsg, data.code, data.data)
      }

      if (response.ok) {
        return {
          code: response.status,
          message: data?.message || '请求成功',
          data: data?.data ?? data,
          success: true,
        }
      }
      const errorMsg = data?.message || data?.error || '请求失败'
      this.errorHandler.showErrorMessage('error', errorMsg)
      throw new HttpError(errorMsg, response.status, data?.data ?? data)
    } else if (contentType?.includes('text/')) {
      const text = await response.text()
      if (response.ok) {
        return {
          code: response.status,
          message: '请求成功',
          data: text,
          success: true,
        }
      }
      this.errorHandler.showErrorMessage('error', '请求失败')
      throw new HttpError('请求失败', response.status, text)
    } else {
      const blob = await response.blob()
      if (response.ok) {
        return {
          code: response.status,
          message: '请求成功',
          data: blob,
          success: true,
        }
      }
      this.errorHandler.showErrorMessage('error', '请求失败')
      throw new HttpError('请求失败', response.status, blob)
    }
  }
}
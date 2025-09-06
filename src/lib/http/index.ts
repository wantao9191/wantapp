// 导出所有类型和接口，保持向后兼容
export type { RequestConfig, ApiResponse, RequestOptions } from './http-client'
export { HttpError } from './http-error-handler'
export { TokenManager } from './token-manager'
export { HttpErrorHandler } from './http-error-handler'
export { ResponseHandler } from './response-handler'
export { HttpClient } from './http-client'

// 导出默认实例，保持原有的使用方式
export { http, default as HttpRequest } from './http-client'

// 为了完全兼容原来的 https.ts，也导出一个默认的 http 实例
export { http as default } from './http-client'
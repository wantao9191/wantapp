import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AccessTokenPayload, verifyAccessToken } from '@/lib/jwt'
// 公共API路径配置
const PUBLIC_API_PATHS = [
  '/api/captcha',
  '/api/admin/login',
  '/api/admin/auth/login',
  '/api/admin/auth/refresh',
  '/api/admin/auth/revoke'
] as const

// 检查是否为公共API
function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))
}

// 受保护 API 前缀（需要鉴权）
function isProtectedApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/admin') && !isPublicApiPath(pathname)
}

// 设置CORS头
function setCorsHeaders(response: NextResponse, origin?: string): NextResponse {
  // 根据环境设置允许的源
  const allowedOrigin = process.env.NODE_ENV === 'production'
    ? (origin && isAllowedOrigin(origin) ? origin : 'null')
    : '*'

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

  // 只有在非通配符时才设置credentials
  if (allowedOrigin !== '*') {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

// 检查是否为允许的源（生产环境使用）
function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  return allowedOrigins.includes(origin)
}

// 创建错误响应
function createErrorResponse(message: string, code: number, origin?: string): NextResponse {
  const response = NextResponse.json(
    { code, message, data: null },
    { status: code }
  )
  return setCorsHeaders(response, origin)
}
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin') || undefined

  // 仅处理 API 路由
  if (pathname.startsWith('/api/')) {
    // 处理预检请求
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })
      return setCorsHeaders(response, origin)
    }

    // 检查是否为公共API
    if (isPublicApiPath(pathname)) {
      const response = NextResponse.next()
      return setCorsHeaders(response, origin)
    }

    // 非受保护 API：直接放行到路由，让路由层处理（可命中 404 兜底）
    if (!isProtectedApiPath(pathname)) {
      const response = NextResponse.next()
      return setCorsHeaders(response, origin)
    }

    // 私有API需要认证
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn(`[Auth] Missing or invalid Authorization header for ${pathname}`)
      return createErrorResponse('Missing or invalid Authorization header', 401, origin)
    }

    const token = authHeader.slice(7)
    try {
      // 只验证JWT有效性，不设置请求头
      await verifyAccessToken(token)
      
      // JWT验证通过，直接放行
      const response = NextResponse.next()
      return setCorsHeaders(response, origin)
    } catch (error: any) {
      // 根据错误类型返回不同的错误信息
      let message = 'Invalid token'
      if (error.code === 'ERR_JWT_EXPIRED') {
        message = 'Token expired'
      } else if (error.code === 'ERR_JWS_INVALID') {
        message = 'Invalid token format'
      } else if (error.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
        message = 'Token validation failed'
      }

      console.warn(`[Auth] Token verification failed for ${pathname}:`, error.message)
      return createErrorResponse(message, 401, origin)
    }
  } else {
    console.log(`[middleware] Non-API route: ${pathname}`)
  }

  // 添加调试头来验证 middleware 是否运行
  const response = NextResponse.next()
  response.headers.set('X-Middleware-Debug', `Processed at ${new Date().toISOString()}`)
  response.headers.set('X-Middleware-Path', pathname)

  return response
}

// 配置匹配路径
export const config = { matcher: ['/api/:path*'] }

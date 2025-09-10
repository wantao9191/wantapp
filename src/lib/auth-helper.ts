// src/lib/auth-helper.ts - JWT直接解析版本

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, AccessTokenPayload } from '@/lib/jwt'
import { unauthorized, forbidden, error } from '@/app/api/_utils/response'

/**
 * 用户上下文信息
 */
export interface UserContext {
  userId: number
  roles: number[]
  permissions: string[]  // 权限使用字符串形式，与API保持一致
  isSuperAdmin: boolean
  organizationId?: number | null
}

export interface UserContextResult {
  success: boolean
  data?: UserContext
  error?: 'unauthorized' | 'server_error'
}

/**
 * 从请求中提取JWT token
 */
function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

// 权限现在直接使用字符串格式，无需映射转换

/**
 * 直接从JWT获取用户上下文信息
 */
export async function getUserContextFromJWT(request: NextRequest): Promise<UserContextResult> {
  const token = extractTokenFromRequest(request)
  if (!token) {
    return {
      success: false,
      error: 'unauthorized'
    }
  }

  try {
    const payload = await verifyAccessToken(token) as AccessTokenPayload

    return {
      success: true,
      data: {
        userId: payload.id,
        roles: payload.roles || [],
        permissions: payload.permissions || [],
        isSuperAdmin: payload.isSuperAdmin || false,
        organizationId: payload.organizationId
      }
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return {
      success: false,
      error: 'unauthorized'
    }
  }
}

/**
 * 兼容性函数 - 保持原有接口
 */
export async function getUserContext(request: NextRequest): Promise<UserContext | null> {
  const result = await getUserContextFromJWT(request)
  return result.success ? result.data! : null
}

export async function getUserContextWithErrorType(request: NextRequest): Promise<UserContextResult> {
  return getUserContextFromJWT(request)
}

/**
 * 直接从JWT检查权限
 */
export async function checkPermissionFromJWT(
  request: NextRequest,
  requiredPermission: string
): Promise<NextResponse | null> {
  const userContextResult = await getUserContextFromJWT(request)

  if (!userContextResult.success) {
    return unauthorized('Unauthorized')
  }

  const userContext = userContextResult.data!

  // 超级管理员或拥有通配符权限直接通过
  if (userContext.isSuperAdmin || userContext.permissions.includes('*')) {
    return null
  }
  // 检查是否有所需权限
  if (!userContext.permissions.includes(requiredPermission)) {
    return forbidden(`Insufficient permissions: ${requiredPermission}`)
  }

  return null // 权限检查通过
}

/**
 * 兼容性函数 - 保持原有接口
 */
export async function checkPermission(
  request: NextRequest,
  requiredPermission: string
): Promise<NextResponse | null> {
  return checkPermissionFromJWT(request, requiredPermission)
}

/**
 * 检查用户认证状态
 */
export async function checkAuth(request: NextRequest): Promise<{
  success: boolean
  userId?: number
  error?: NextResponse
}> {
  const userContextResult = await getUserContextFromJWT(request)

  if (!userContextResult.success) {
    return {
      success: false,
      error: unauthorized('Authentication required')
    }
  }

  return {
    success: true,
    userId: userContextResult.data!.userId
  }
}

/**
 * 权限检查装饰器/高阶函数
 */
export function withPermissionCheck(requiredPermission: string) {
  return function <T extends any[], R>(
    handler: (request: NextRequest, context: UserContext, ...args: T) => Promise<R>
  ) {
    return async function (request: NextRequest, ...args: T): Promise<R | NextResponse> {
      const userContextResult = await getUserContextFromJWT(request)

      if (!userContextResult.success) {
        return unauthorized('Unauthorized')
      }

      const userContext = userContextResult.data!

      // 检查权限
      if (!userContext.isSuperAdmin &&
        !userContext.permissions.includes('*') &&
        !userContext.permissions.includes(requiredPermission)) {
        return forbidden(`Insufficient permissions: ${requiredPermission}`)
      }

      return handler(request, userContext, ...args)
    }
  }
}

/**
 * 认证检查装饰器
 */
export function withAuth() {
  return function <T extends any[], R>(
    handler: (request: NextRequest, context: UserContext, ...args: T) => Promise<R>
  ) {
    return async function (request: NextRequest, ...args: T): Promise<R | NextResponse> {
      const userContextResult = await getUserContextFromJWT(request)

      if (!userContextResult.success) {
        return unauthorized('Authentication required')
      }

      return handler(request, userContextResult.data!, ...args)
    }
  }
}

/**
 * 批量权限检查
 */
export async function checkMultiplePermissions(
  request: NextRequest,
  permissions: string[],
  requireAll = true // true: 需要所有权限, false: 需要任一权限
): Promise<NextResponse | null> {
  const userContextResult = await getUserContextFromJWT(request)

  if (!userContextResult.success) {
    return unauthorized('Unauthorized')
  }

  const userContext = userContextResult.data!

  // 超级管理员或通配符权限直接通过
  if (userContext.isSuperAdmin || userContext.permissions.includes('*')) {
    return null
  }

  // 检查权限
  const hasPermissions = permissions.map(permission =>
    userContext.permissions.includes(permission)
  )

  const passed = requireAll
    ? hasPermissions.every(Boolean)
    : hasPermissions.some(Boolean)

  if (!passed) {
    const message = requireAll
      ? `Missing permissions: ${permissions.join(', ')}`
      : `Missing any of permissions: ${permissions.join(', ')}`

    return forbidden(message)
  }

  return null
}

/**
 * 机构过滤辅助函数
 * 用于在API处理器中应用机构过滤逻辑
 */
export function applyOrganizationFilter(
  context: { organizationId?: number; isSuperAdmin?: boolean } | undefined,
  data: any,
  organizationIdField: string = 'organizationId'
): any {
  // 如果没有上下文或用户是超级管理员，不进行过滤
  if (!context || context.isSuperAdmin) {
    return data
  }

  // 如果用户没有机构ID，返回空数据
  if (!context.organizationId) {
    return Array.isArray(data) ? [] : null
  }

  // 对数据进行机构过滤
  if (Array.isArray(data)) {
    return data.filter(item => {
      if (typeof item === 'object' && item !== null) {
        return item[organizationIdField] === context.organizationId
      }
      return false
    })
  } else if (typeof data === 'object' && data !== null) {
    // 单个对象的情况
    if (data[organizationIdField] !== context.organizationId) {
      return null
    }
  }

  return data
}

/**
 * 检查数据是否属于用户机构
 */
export function checkOrganizationAccess(
  context: { organizationId?: number; isSuperAdmin?: boolean } | undefined,
  targetOrganizationId: number | undefined
): boolean {
  // 超级管理员可以访问所有数据
  if (!context || context.isSuperAdmin) {
    return true
  }

  // 如果用户没有机构ID，拒绝访问
  if (!context.organizationId) {
    return false
  }

  // 检查目标数据是否属于用户机构
  return targetOrganizationId === context.organizationId
}
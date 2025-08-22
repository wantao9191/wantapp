// src/lib/auth-helper.ts

import { NextRequest, NextResponse } from 'next/server'
import { hasPermission, getUserPermissions, isSuperAdmin } from '@/lib/permissions'

/**
 * 从请求头获取用户ID
 */
export function getUserIdFromHeaders(request: NextRequest): number | null {
  const userIdHeader = request.headers.get('X-User-Id')
  if (!userIdHeader) {
    return null
  }

  const userId = parseInt(userIdHeader)
  return isNaN(userId) ? null : userId
}

/**
 * 从请求头获取用户角色
 */
export function getUserRolesFromHeaders(request: NextRequest): number[] {
  const rolesHeader = request.headers.get('X-User-Roles')
  if (!rolesHeader) {
    return []
  }

  try {
    return JSON.parse(rolesHeader)
  } catch {
    return []
  }
}

/**
 * 获取用户上下文信息
 */
export interface UserContext {
  userId: number
  roles: number[]
  permissions: string[]
  isSuperAdmin: boolean
}

export async function getUserContext(request: NextRequest): Promise<UserContext | null> {
  const userId = getUserIdFromHeaders(request)
  if (!userId) {
    return null
  }

  try {
    const [permissions, isAdmin] = await Promise.all([
      getUserPermissions(userId),
      isSuperAdmin(userId)
    ])

    const roles = getUserRolesFromHeaders(request)

    return {
      userId,
      roles,
      permissions,
      isSuperAdmin: isAdmin
    }
  } catch (error) {
    console.error('Failed to get user context:', error)
    return null
  }
}

/**
 * 检查用户权限
 */
export async function checkPermission(
  request: NextRequest,
  requiredPermission: string
): Promise<NextResponse | null> {
  const userId = getUserIdFromHeaders(request)

  if (!userId) {
    return NextResponse.json({
      code: 401,
      message: 'Unauthorized - User ID not found',
      data: null
    }, { status: 401 })
  }

  try {
    const hasRequiredPermission = await hasPermission(userId, requiredPermission)

    if (!hasRequiredPermission) {
      return NextResponse.json({
        code: 403,
        message: `Insufficient permissions: ${requiredPermission}`,
        data: null
      }, { status: 403 })
    }

    return null // 权限检查通过
  } catch (error) {
    console.error('Permission check error:', error)
    return NextResponse.json({
      code: 500,
      message: 'Internal server error during permission check',
      data: null
    }, { status: 500 })
  }
}

/**
 * 检查用户认证状态
 */
export async function checkAuth(request: NextRequest): Promise<{
  success: boolean
  userId?: number
  error?: NextResponse
}> {
  const userId = getUserIdFromHeaders(request)

  if (!userId) {
    return {
      success: false,
      error: NextResponse.json({
        code: 401,
        message: 'Authentication required',
        data: null
      }, { status: 401 })
    }
  }

  return {
    success: true,
    userId
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
      // 获取用户上下文
      const userContext = await getUserContext(request)

      if (!userContext) {
        return NextResponse.json({
          code: 401,
          message: 'Unauthorized',
          data: null
        }, { status: 401 })
      }

      // 检查权限
      if (!userContext.isSuperAdmin && !userContext.permissions.includes(requiredPermission)) {
        return NextResponse.json({
          code: 403,
          message: `Insufficient permissions: ${requiredPermission}`,
          data: null
        }, { status: 403 })
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
      const userContext = await getUserContext(request)

      if (!userContext) {
        return NextResponse.json({
          code: 401,
          message: 'Authentication required',
          data: null
        }, { status: 401 })
      }

      return handler(request, userContext, ...args)
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
  const userId = getUserIdFromHeaders(request)

  if (!userId) {
    return NextResponse.json({
      code: 401,
      message: 'Unauthorized',
      data: null
    }, { status: 401 })
  }

  try {
    const userPermissions = await getUserPermissions(userId)
    const isAdmin = await isSuperAdmin(userId)

    // 超级管理员直接通过
    if (isAdmin || userPermissions.includes('*')) {
      return null
    }

    // 检查权限
    const hasPermissions = permissions.map(permission =>
      userPermissions.includes(permission)
    )

    const passed = requireAll
      ? hasPermissions.every(Boolean)
      : hasPermissions.some(Boolean)

    if (!passed) {
      const message = requireAll
        ? `Missing permissions: ${permissions.join(', ')}`
        : `Missing any of permissions: ${permissions.join(', ')}`

      return NextResponse.json({
        code: 403,
        message,
        data: null
      }, { status: 403 })
    }

    return null
  } catch (error) {
    console.error('Multiple permissions check error:', error)
    return NextResponse.json({
      code: 500,
      message: 'Internal server error',
      data: null
    }, { status: 500 })
  }
}

/**
 * 获取API路径对应的权限要求
 */
export async function getRequiredPermissionFromPath(
  pathname: string,
  method: string
): Promise<string | null> {
  // 这里可以从数据库或配置文件获取
  // 暂时使用简单的映射
  const pathPermissionMap: Record<string, string> = {
    '/api/admin/users': 'user_management',
    '/api/admin/roles': 'role_management',
    '/api/admin/permissions': 'permission_management',
    '/api/admin/organizations': 'organization_management',
    '/api/admin/settings': 'system_settings'
  }

  // 直接匹配
  if (pathPermissionMap[pathname]) {
    return pathPermissionMap[pathname]
  }

  // 动态路由匹配
  for (const [pattern, permission] of Object.entries(pathPermissionMap)) {
    if (matchDynamicRoute(pathname, pattern)) {
      return permission
    }
  }

  return null
}

/**
 * 动态路由匹配辅助函数
 */
function matchDynamicRoute(pathname: string, pattern: string): boolean {
  const pathSegments = pathname.split('/')
  const patternSegments = pattern.split('/')

  if (pathSegments.length !== patternSegments.length) {
    return false
  }

  return patternSegments.every((segment, index) => {
    // [id] 或 [slug] 等动态参数
    if (segment.startsWith('[') && segment.endsWith(']')) {
      return true
    }
    return segment === pathSegments[index]
  })
}

/**
 * 自动权限检查（根据路径自动判断所需权限）
 */
export async function autoCheckPermission(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = new URL(request.url)
  const method = request.method

  const requiredPermission = await getRequiredPermissionFromPath(pathname, method)

  if (!requiredPermission) {
    return null // 不需要权限检查
  }

  return checkPermission(request, requiredPermission)
}

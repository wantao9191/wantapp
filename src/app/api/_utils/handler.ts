// src/app/api/_utils/handler.ts (增强版)

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { ok, error, unauthorized } from './response'
import { checkPermission, getUserContextWithErrorType } from '@/lib/auth-helper'

// 修复类型定义：适配 Next.js App Router 的参数传递方式
export type HandlerWithParams = (req: NextRequest, params: { id: string }, context?: { userId: number; organizationId?: number; isSuperAdmin?: boolean }) => Promise<any> | any
export type Handler = (req: NextRequest, context?: { userId: number; organizationId?: number; isSuperAdmin?: boolean }) => Promise<any> | any
export type Handlers = Partial<Record<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', Handler | HandlerWithParams>>

export interface HandlerOptions {
  permission?: string
  requireAuth?: boolean
  hasParams?: boolean
  organizationFilter?: boolean // 是否启用机构过滤
}

export interface HandlerParams {
  id: string  // 改为必需属性，因为 hasParams 为 true 时必须有 id
}

// 验证参数是否有效
function validateParams(params?: HandlerParams): boolean {
  if (!params?.id) return false
  const id = parseInt(params.id)
  return !isNaN(id) && id > 0
}

// 检查处理器是否支持参数
function supportsParams(handler: Function): boolean {
  // 检查函数是否接受 params 参数
  // 通过检查函数字符串表示来判断
  const handlerStr = handler.toString()
  return handlerStr.includes('params') || handlerStr.includes('(request, params')
}

// 修复 Next.js 15 类型兼容性
type RouteContext = { params?: HandlerParams | Promise<HandlerParams> }

// 增强的处理器创建函数 - 修复参数传递方式
export function createHandler(handler: Handler | HandlerWithParams, options?: HandlerOptions): (req: NextRequest, context?: RouteContext) => Promise<NextResponse>
export function createHandler(handlers: Handlers, options?: HandlerOptions): (req: NextRequest, context?: RouteContext) => Promise<NextResponse>
export function createHandler(arg: Handler | HandlerWithParams | Handlers, options: HandlerOptions = {}) {
  const { permission, requireAuth = true, hasParams = false } = options

  if (typeof arg === 'function') {
    const handler = arg as Handler | HandlerWithParams
    return async function route(request: NextRequest, context?: RouteContext) {
      try {
        // 处理 Next.js App Router 的参数结构
        let resolvedParams: HandlerParams | undefined

        // 从 context 中提取 params
        if (context?.params) {
          if (context.params instanceof Promise) {
            resolvedParams = await context.params
          } else {
            resolvedParams = context.params
          }
        }
        // 验证参数
        if (hasParams && (!resolvedParams || !validateParams(resolvedParams))) {
          return error('Invalid parameters', 400)
        }

        const authResult = await checkAuth(request, permission, requireAuth)
        if (authResult.error) {
          return authResult.error
        }

        // 安全地调用处理器 - 修复参数传递顺序
        if (hasParams && resolvedParams) {
          // 检查处理器是否支持参数
          if (supportsParams(handler)) {
            const data = await (handler as HandlerWithParams)(request, resolvedParams, authResult.context)
            if (data instanceof NextResponse) return data
            return ok(data)
          } else {
            return error('Handler does not support parameters', 500)
          }
        } else {
          const data = await (handler as Handler)(request, authResult.context)
          if (data instanceof NextResponse) return data
          return ok(data)
        }
      } catch (e: any) {
        console.error('API Error:', e)
        return error(e?.message || 'Internal Server Error', e?.status || 500)
      }
    }
  }

  const handlers = arg as Handlers
  return async function route(request: NextRequest, context?: RouteContext) {
    const method = request.method as keyof Handlers
    const handle = handlers[method]
    if (!handle) {
      return error('Method Not Allowed', 405, { headers: { Allow: Object.keys(handlers).join(', ') } })
    }

    try {
      // 处理 Next.js App Router 的参数结构
      let resolvedParams: HandlerParams | undefined

      // 从 context 中提取 params
      if (context?.params) {
        if (context.params instanceof Promise) {
          resolvedParams = await context.params
        } else {
          resolvedParams = context.params
        }
      }

      // 验证参数
      if (hasParams && (!resolvedParams || !validateParams(resolvedParams))) {
        return error('Invalid parameters', 400)
      }

      const authResult = await checkAuth(request, permission, requireAuth)
      if (authResult.error) {
        return authResult.error
      }

      if (hasParams && resolvedParams) {
        if (supportsParams(handle)) {
          const data = await (handle as HandlerWithParams)(request, resolvedParams, authResult.context)
          if (data instanceof NextResponse) return data
          return ok(data)
        } else {
          return error('Handler does not support parameters', 500)
        }
      } else {
        const data = await (handle as Handler)(request, authResult.context)
        if (data instanceof NextResponse) return data
        return ok(data)
      }
    } catch (e: any) {
      console.error('API Error:', e)
      return error(e?.message || 'Internal Server Error', e?.status || 500)
    }
  }
}

// 认证检查辅助函数
async function checkAuth(request: NextRequest, permission?: string, requireAuth = true) {
  if (!requireAuth) {
    return { context: undefined, error: null }
  }

  // 获取用户上下文
  const userContextResult = await getUserContextWithErrorType(request)
  if (!userContextResult.success) {
    if (userContextResult.error === 'server_error') {
      return {
        context: undefined,
        error: error('Server connection failed', 500)
      }
    } else {
      return {
        context: undefined,
        error: unauthorized('Authentication required')
      }
    }
  }

  const userContext = userContextResult.data!

  // 权限检查
  if (permission) {
    const permissionError = await checkPermission(request, permission)
    if (permissionError) {
      return {
        context: undefined,
        error: permissionError
      }
    }
  }

  return {
    context: {
      userId: userContext.userId,
      organizationId: userContext.organizationId,
      isSuperAdmin: userContext.isSuperAdmin
    },
    error: null
  }
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
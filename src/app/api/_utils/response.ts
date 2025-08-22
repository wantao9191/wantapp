import { NextResponse } from 'next/server'

export type Ok<T = any> = {
  code: number
  message: string
  data: T
}

export type Err = {
  code: number
  message: string
  data?: null
}

// 分页结果类型
export type PaginatedResult<T = any> = {
  contents: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function ok<T>(data: T, message = 'OK', init?: ResponseInit) {
  const body: Ok<T> = { code: 200, message, data }
  return NextResponse.json(body, init)
}

export function error(message = 'Server Error', code = 500, init?: ResponseInit) {
  const body: Err = { code, message }
  return NextResponse.json(body, { status: code, ...init })
}

export function methodNotAllowed(allow: string[]) {
  return error(`Method Not Allowed. Allowed: ${allow.join(', ')}`, 405, {
    headers: { Allow: allow.join(', ') },
  })
}

export function badRequest(message = 'Bad Request') {
  return error(message, 400)
}

export function unauthorized(message = 'Unauthorized') {
  return error(message, 401)
}

export function forbidden(message = 'Forbidden') {
  return error(message, 403)
}
export function notFound(message = 'Not Found') {
  return error(message, 404)
}

// 简化的分页结果（只包含必要信息）
export function paginatedSimple<T>(
  list: T[],
  page: number,
  pageSize: number,
  total: number,
): PaginatedResult {
  return {
    contents: list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}



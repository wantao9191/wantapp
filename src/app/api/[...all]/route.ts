import { NextResponse } from 'next/server'
import { notFound } from '../_utils/response'
// 捕获所有未匹配的 API 路由，统一返回 404 JSON
export function GET() {
  return notFound()
}

export function POST() {
  return notFound()
}

export function PUT() {
  return notFound()
}

export function PATCH() {
  return notFound()
}

export function DELETE() {
  return notFound()
}



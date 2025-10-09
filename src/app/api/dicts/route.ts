import { NextRequest, NextResponse } from 'next/server'
import { createHandler } from '../_utils/handler'
import { db } from '@/db'
import { dicts } from '@/db/schema'
import { eq } from 'drizzle-orm'
export const GET = createHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code') || ''
  const data = await db.select().from(dicts).where(eq(dicts.code, code as string))
  return data
}, {
  requireAuth: false
})
import { createHandler } from '../../../_utils/handler'
import { NextRequest } from 'next/server'
import { db } from '@/db'
import { permissions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
export const GET = createHandler(async (request: NextRequest) => {
  const data = await db.select()
    .from(permissions)
    .where(and(eq(permissions.deleted, false), eq(permissions.status, 1)))
    .orderBy(permissions.createTime)
  return { contents: data }
}, {
  requireAuth: false
})
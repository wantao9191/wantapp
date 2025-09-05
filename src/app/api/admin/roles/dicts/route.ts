import { createHandler } from '../../../_utils/handler'
import { NextRequest } from 'next/server'
import { db } from '@/db'
import { roles } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export const GET = createHandler(async (request: NextRequest) => {
  const data = await db.select()
    .from(roles)
    .where(and(eq(roles.deleted, false), eq(roles.status, 1)))
    .orderBy(roles.createTime)
  return { contents: data }
}, {
  requireAuth: false
})
import { createHandler } from '../../../_utils/handler'
import { NextRequest } from 'next/server'
import { db } from '@/db'
import { organizations } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
export const GET = createHandler(async (request: NextRequest) => {
  const data = await db.select({
    label: organizations.name,
    value: organizations.id
  })
    .from(organizations)
    .where(and(eq(organizations.deleted, false), eq(organizations.status, 1)))
    .orderBy(organizations.createTime)
  return { contents: data }
}, {
  requireAuth: false
})
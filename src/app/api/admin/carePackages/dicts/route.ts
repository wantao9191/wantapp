import { createHandler } from '../../../_utils/handler'
import { NextRequest } from 'next/server'
import { db } from '@/db'
import { carePackages } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export const GET = createHandler(async (request: NextRequest) => {
  const data = await db.select({
    label: carePackages.name,
    value: carePackages.id
  })
    .from(carePackages)
    .where(and(eq(carePackages.deleted, false), eq(carePackages.status, 1)))
    .orderBy(carePackages.createTime)
  return { contents: data }
}, {
  requireAuth: false
})
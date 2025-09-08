import { createHandler } from '../../../_utils/handler'
import { NextRequest } from 'next/server'
import { db } from '@/db'
import { menus } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { buildMenuTree } from '@/lib/utils'

export const GET = createHandler(async (request: NextRequest) => {
  const data = await db.select({
    label: menus.name,
    value: menus.id
  })
    .from(menus)
    .where(and(eq(menus.deleted, false), eq(menus.status, 1)))
    .orderBy(menus.createTime)
  return { contents: buildMenuTree(data) }
}, {
  requireAuth: true
})
import { createHandler } from '../../../_utils/handler'
import { NextRequest } from 'next/server'
import { db } from '@/db'
import { menus, } from '@/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { buildMenuTree } from '@/lib/utils'
import { getUserRoles } from '@/lib/permissions'

export const GET = createHandler(async (request: NextRequest, context?: { userId: number; organizationId?: number; isSuperAdmin?: boolean }) => {
  const whereConditions = [eq(menus.deleted, false), eq(menus.status, 1)]
  if (context && !context.isSuperAdmin && context.organizationId) {
    const userRoles = await getUserRoles(context.userId)
    whereConditions.push(inArray(menus.id, userRoles.flatMap(role => role.menus || [])))
  }
  const data = await db.select()
    .from(menus)
    .where(and(...whereConditions))
    .orderBy(menus.sort)
  return { contents: buildMenuTree(data) }
}, {
  requireAuth: true
})
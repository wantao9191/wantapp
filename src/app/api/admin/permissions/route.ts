import { paginatedSimple } from "../../_utils/response"
import { NextRequest } from "next/server"
import { createHandler } from "../../_utils/handler"
import { permissionSchema, pageSchema } from "@/lib/validations"
import { permissions } from "@/db/schema"
import { db } from "@/db"
import { count } from "drizzle-orm"
import { eq, like, and } from "drizzle-orm"

export const GET = createHandler(async (request: NextRequest) => {
  const url = new URL(request.url)
  const page = url.searchParams.get('page') || '1'
  const pageSize = url.searchParams.get('pageSize') || '10'
  const status = url.searchParams.get('status')
  const name = url.searchParams.get('name') || ''
  const pageParams = pageSchema.safeParse({ page: Number(page), pageSize: Number(pageSize) })
  if (!pageParams.success) {
    throw new Error(pageParams.error.errors[0].message)
  }
  const whereConditions = [eq(permissions.deleted, false)]
  if (status !== undefined && status !== null) {
    whereConditions.push(eq(permissions.status, Number(status)))
  }
  if (name) {
    whereConditions.push(like(permissions.name, `%${name}%`))
  }
  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined
  // 并行执行两个查询：获取数据和总数
  const [permission, totalResult] = await Promise.all([
    db.select()
      .from(permissions)
      .where(whereClause)
      .limit(pageParams.data.pageSize)
      .offset((pageParams.data.page - 1) * pageParams.data.pageSize)
      .orderBy(permissions.createTime),
    db.select({ count: count() }).from(permissions).where(whereClause)
  ])
  const total = totalResult[0]?.count || 0
  return paginatedSimple(permission, pageParams.data.page, pageParams.data.pageSize, total)
}, {
  permission: 'permission:read',
  requireAuth: true
})

export const POST = createHandler(async (request: NextRequest) => {
  const parmas = permissionSchema.safeParse(await request.json())
  if (!parmas.success) {
    throw new Error(parmas.error.errors[0].message)
  }
  const hasPermission = await db.select().from(permissions).where(eq(permissions.code, parmas.data.code))
  if (hasPermission.length > 0) {
    throw new Error('权限编码已存在')
  }
  const permission = await db.insert(permissions).values({
    ...parmas.data
  }).returning()
  return permission
}, {
  permission: 'permission:write',
  requireAuth: true
})
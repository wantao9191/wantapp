import { paginatedSimple } from "../../_utils/response"
import { NextRequest } from "next/server"
import { createHandler } from "../../_utils/handler"
import { organizationSchema, pageSchema } from "@/lib/validations"
import { organizations } from "@/db/schema"
import { db } from "@/db"
import { count } from "drizzle-orm"
import { generateRandomString } from "@/lib/utils"
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
  const whereConditions = [eq(organizations.deleted, false)]
  if (status !== undefined && status !== null) {
    whereConditions.push(eq(organizations.status, Number(status)))
  }
  if (name) {
    whereConditions.push(like(organizations.name, `%${name}%`))
  }
  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

  // 并行执行两个查询：获取数据和总数
  const [orgs, totalResult] = await Promise.all([
    db.select()
      .from(organizations)
      .where(whereClause)
      .limit(pageParams.data.pageSize)
      .offset((pageParams.data.page - 1) * pageParams.data.pageSize)
      .orderBy(organizations.createTime),
    db.select({ count: count() }).from(organizations).where(whereClause)
  ])
  const total = totalResult[0]?.count || 0
  return paginatedSimple(orgs, pageParams.data.page, pageParams.data.pageSize, total)
}, {
  permission: 'organization:read',
  requireAuth: true
})

export const POST = createHandler(async (request: NextRequest) => {
  const parmas = organizationSchema.safeParse(await request.json())
  if (!parmas.success) {
    throw new Error(parmas.error.errors[0].message)
  }
  const org = await db.insert(organizations).values({
    ...parmas.data,
    code: generateRandomString(8),
    setupTime: parmas.data.setupTime ? new Date(parmas.data.setupTime) : undefined
  }).returning()
  return org
}, {
  permission: 'organization:write',
  requireAuth: true
})
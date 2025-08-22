import { NextRequest, NextResponse } from 'next/server'
import { createHandler } from '../../_utils/handler'
import { pageSchema, roleSchema } from '@/lib/validations'
import { roles } from '@/db/schema'
import { db } from '@/db'
import { eq, and, like, count } from 'drizzle-orm'
import { paginatedSimple } from '../../_utils/response'

export const GET = createHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page')
  const pageSize = searchParams.get('pageSize')
  const name = searchParams.get('name') || ''
  const status = searchParams.get('status')
  const pageParams = pageSchema.safeParse({ page: Number(page), pageSize: Number(pageSize) })
  if (!pageParams.success) {
    throw new Error(pageParams.error.errors[0].message)
  }
  const whereConditions = [eq(roles.deleted, false)]
  if (name) {
    whereConditions.push(like(roles.name, `%${name}%`))
  }
  if (status) {
    whereConditions.push(eq(roles.status, Number(status)))
  }
  const [contents, totalResult] = await Promise.all([
    db.select()
      .from(roles)
      .where(and(...whereConditions))
      .limit(pageParams.data.pageSize)
      .offset((pageParams.data.page - 1) * pageParams.data.pageSize).orderBy(roles.createTime),
    db.select({ count: count() }).from(roles).where(and(...whereConditions))
  ])
  const total = totalResult[0]?.count || 0
  return paginatedSimple(contents,pageParams.data.page, pageParams.data.pageSize, total)
}, {
  permission: 'role:read',
  requireAuth: true
})

export const POST = createHandler(async (request: NextRequest) => {
  const params = roleSchema.safeParse(await request.json())
  if (!params.success) {
    throw new Error(params.error.errors[0].message)
  }
  const role = await db.insert(roles).values({
    ...params.data,
    code: params.data.name.toLowerCase().replace(/ /g, '_'),
    status: params.data.status || 1,
    deleted: false
  }).returning()
  return NextResponse.json(role)
}, {
  permission: 'role:create',
  requireAuth: true
})
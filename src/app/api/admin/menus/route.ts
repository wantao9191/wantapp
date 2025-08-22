import { NextRequest, NextResponse } from 'next/server'
import { createHandler } from '../../_utils/handler'
import { pageSchema, menuSchema } from '@/lib/validations'
import { menus } from '@/db/schema'
import { db } from '@/db'
import { eq, and, like, count, isNotNull } from 'drizzle-orm'
import { paginatedSimple } from '../../_utils/response'
import { buildMenuTree } from '@/lib/utils'

export const GET = createHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page')
  const pageSize = searchParams.get('pageSize')
  const name = searchParams.get('name') || ''
  const status = searchParams.get('status')
  const noParent = searchParams.get('noParent')
  const pageParams = pageSchema.safeParse({ page: Number(page), pageSize: Number(pageSize) })
  if (!pageParams.success) {
    throw new Error(pageParams.error.errors[0].message)
  }
  const whereConditions = [eq(menus.deleted, false)]
  if (noParent === '1') {
    whereConditions.push(isNotNull(menus.parentCode))
  }
  if (name) {
    whereConditions.push(like(menus.name, `%${name}%`))
  }
  if (status) {
    whereConditions.push(eq(menus.status, Number(status)))
  }
  const [contents, totalResult] = await Promise.all([
    db.select()
      .from(menus)
      .where(and(...whereConditions))
      .limit(pageParams.data.pageSize)
      .offset((pageParams.data.page - 1) * pageParams.data.pageSize).orderBy(menus.createTime),
    db.select({ count: count() }).from(menus).where(and(...whereConditions))
  ])
  const total = totalResult[0]?.count || 0
  const menuList = noParent === '1' ? contents : buildMenuTree(contents)
  return paginatedSimple(menuList, pageParams.data.page, pageParams.data.pageSize, total)
}, {
  permission: 'menu:read',
  requireAuth: true
})

export const POST = createHandler(async (request: NextRequest) => {
  const params = menuSchema.safeParse(await request.json())
  if (!params.success) {
    throw new Error(params.error.errors[0].message)
  }
  const menu = await db.insert(menus).values({
    ...params.data,
    code: params.data.name.toLowerCase().replace(/ /g, '_'),
    status: params.data.status || 1,
    deleted: false
  }).returning()
  return NextResponse.json(menu)
}, {
  permission: 'menu:create',
  requireAuth: true
})
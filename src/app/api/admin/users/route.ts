import { NextRequest, NextResponse } from 'next/server'
import { createHandler } from '../../_utils/handler'
import { pageSchema, userSchema } from '@/lib/validations'
import { organizations, roles, users } from '@/db/schema'
import { db } from '@/db'
import { eq, and, like, count, inArray } from 'drizzle-orm'
import { paginatedSimple } from '../../_utils/response'
import bcrypt from 'bcryptjs'
export const GET = createHandler(async (request: NextRequest, context?: { userId: number; organizationId?: number; isSuperAdmin?: boolean }) => {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page')
  const pageSize = searchParams.get('pageSize')
  const name = searchParams.get('name') || ''
  const status = searchParams.get('status')
  const pageParams = pageSchema.safeParse({ page: Number(page), pageSize: Number(pageSize) })
  if (!pageParams.success) {
    throw new Error(pageParams.error.errors[0].message)
  }

  const whereConditions = [eq(users.deleted, false)]

  // 如果不是超级管理员，添加机构过滤条件
  if (context && !context.isSuperAdmin && context.organizationId) {
    whereConditions.push(eq(users.organizationId, context.organizationId))
  }

  if (name) {
    whereConditions.push(like(users.name, `%${name}%`))
  }
  if (status) {
    whereConditions.push(eq(users.status, Number(status)))
  }

  const [contents, totalResult] = await Promise.all([
    db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      phone: users.phone,
      email: users.email,
      status: users.status,
      createTime: users.createTime,
      description: users.description,
      roles: users.roles,
      organizationId: users.organizationId,
      organizationName: organizations.name,
    })
      .from(users)
      .leftJoin(organizations, eq(users.organizationId, organizations.id))
      .where(and(...whereConditions))
      .limit(pageParams.data.pageSize)
      .offset((pageParams.data.page - 1) * pageParams.data.pageSize)
      .orderBy(users.createTime),
    db.select({ count: count() }).from(users).where(and(...whereConditions))
  ])
  
  // 收集所有角色ID
  const allRoleIds = contents
    .map(user => user.roles || [])
    .flat()
    .filter((id, index, arr) => arr.indexOf(id) === index) // 去重

  // 批量查询所有角色信息
  const roleMap = new Map()
  if (allRoleIds.length > 0) {
    const rolesData = await db.select()
      .from(roles)
      .where(inArray(roles.id, allRoleIds))
    
    // 创建角色ID到名称的映射
    rolesData.forEach(role => {
      roleMap.set(role.id, role.name)
    })
  }

  // 为每个用户添加角色名称
  const enrichedContents = contents.map(user => ({
    ...user,
    roleNames: (user.roles || []).map(roleId => roleMap.get(roleId)).filter(Boolean)
  }))

  const total = totalResult[0]?.count || 0
  return paginatedSimple(enrichedContents, pageParams.data.page, pageParams.data.pageSize, total)
}, {
  permission: 'user:read',
  requireAuth: true,
  organizationFilter: true
})

export const POST = createHandler(async (request: NextRequest, context?: { userId: number; organizationId?: number; isSuperAdmin?: boolean }) => {
  const params = userSchema.safeParse(await request.json())
  if (!params.success) {
    throw new Error(params.error.errors[0].message)
  }

  // 如果不是超级管理员，确保新用户属于当前用户的机构
  const userData = { ...params.data }
  if (context && !context.isSuperAdmin && context.organizationId) {
    userData.organizationId = context.organizationId
  }
  const org = await db.select().from(organizations).where(eq(organizations.id, params.data.organizationId as number))
  if (!org[0]) {
    throw new Error('机构不存在')
  }
  const rolesInfo = await db.select().from(roles).where(inArray(roles.id, params.data.roles as number[]))
  if (!rolesInfo[0] || rolesInfo.length !== (params.data.roles as number[]).length) {
    throw new Error('角色不存在')
  }
  const role = await db.insert(users).values({
    ...userData,
    username: params.data.name.toLowerCase().replace(/ /g, '_'),
    status: params.data.status || 1,
    password: await bcrypt.hash('12345@Aa', 10),
    deleted: false
  }).returning()
  return NextResponse.json(role)
}, {
  permission: 'user:create',
  requireAuth: true,
  organizationFilter: true
})
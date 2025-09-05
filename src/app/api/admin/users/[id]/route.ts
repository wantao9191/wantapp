import { NextRequest } from "next/server"
import { createHandler, checkOrganizationAccess } from "../../../_utils/handler"
import { userSchema } from "@/lib/validations"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export const PUT = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params
  const parmas = userSchema.safeParse(await request.json())
  if (!parmas.success) {
    throw new Error(parmas.error.errors[0].message)
  }

  // 如果不是超级管理员，检查要更新的用户是否属于当前用户的机构
  if (context && !context.isSuperAdmin) {
    const existingUser = await db
      .select({ organizationId: users.organizationId })
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1)

    if (!existingUser[0] || !checkOrganizationAccess(context, existingUser[0].organizationId || undefined)) {
      throw new Error('无权操作该用户')
    }
  }
  if (id === context?.userId.toString()) {
    throw new Error('不能修改自己的信息')
  }
  const whereConditions = [eq(users.id, parseInt(id))]

  // 如果不是超级管理员，添加机构过滤条件
  if (context && !context.isSuperAdmin && context.organizationId) {
    whereConditions.push(eq(users.organizationId, context.organizationId))
  }

  const role = await db.update(users).set({
    ...parmas.data,
  }).where(and(...whereConditions)).returning()
  return role
}, {
  permission: 'user:write',
  requireAuth: true,
  hasParams: true,
  organizationFilter: true
})

export const DELETE = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params

  // 如果不是超级管理员，检查要删除的用户是否属于当前用户的机构
  if (context && !context.isSuperAdmin) {
    const existingUser = await db
      .select({ organizationId: users.organizationId })
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1)

    if (!existingUser[0] || !checkOrganizationAccess(context, existingUser[0].organizationId || undefined)) {
      throw new Error('无权操作该用户')
    }
  }

  const whereConditions = [eq(users.id, parseInt(id))]

  // 如果不是超级管理员，添加机构过滤条件
  if (context && !context.isSuperAdmin && context.organizationId) {
    whereConditions.push(eq(users.organizationId, context.organizationId))
  }

  const user = await db.update(users).set({
    deleted: true
  }).where(and(...whereConditions)).returning()
  if (!user || user.length === 0) {
    throw new Error('用户不存在或无权限操作')
  }
  return
}, {
  permission: 'user:write',
  requireAuth: true,
  hasParams: true,
  organizationFilter: true
})

import { createHandler, checkOrganizationAccess } from "../../../_utils/handler"
import { NextRequest } from "next/server"
import { carePackageSchema } from "@/lib/validations"
import { db } from "@/db"
import { carePackages } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export const PUT = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params
  const data = carePackageSchema.safeParse(await request.json())
  if (!data.success) {
    console.log(data.error.errors)
    throw new Error(data.error.errors[0].message)
  }

  const whereConditions = [eq(carePackages.id, parseInt(id))]

  // 如果不是超级管理员，添加机构过滤条件
  if (context && !context.isSuperAdmin && context.organizationId) {
    whereConditions.push(eq(carePackages.organizationId, context.organizationId))
  }

  const [packages] = await db.update(carePackages).set(data.data).where(and(...whereConditions)).returning()
  if (!packages) {
    throw new Error('护理套餐不存在或无权限操作')
  }
  return 'ok'
}, {
  permission: 'careplan:write',
  requireAuth: true,
  hasParams: true
})

export const DELETE = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params

  const whereConditions = [eq(carePackages.id, parseInt(id))]

  // 如果不是超级管理员，添加机构过滤条件
  if (context && !context.isSuperAdmin && context.organizationId) {
    whereConditions.push(eq(carePackages.organizationId, context.organizationId))
  }

  const [packages] = await db.update(carePackages).set({
    deleted: true
  }).where(and(...whereConditions)).returning()
  if (!packages) {
    throw new Error('护理套餐不存在或无权限操作')
  }
  return 'ok'
}, {
  permission: 'careplan:write',
  requireAuth: true,
  hasParams: true
})
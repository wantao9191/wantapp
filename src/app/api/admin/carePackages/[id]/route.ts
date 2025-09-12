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

  // 先查询现有护理套餐信息
  const [currentPackage] = await db.select().from(carePackages).where(eq(carePackages.id, parseInt(id))).limit(1)
  if (!currentPackage) {
    throw new Error('护理套餐不存在')
  }

  // 权限校验：非超级管理员只能操作自己机构的护理套餐
  if (!context?.isSuperAdmin) {
    if (currentPackage.organizationId !== Number(context?.organizationId)) {
      throw new Error('无权限操作该护理套餐')
    }
  }

  await db.update(carePackages).set(data.data).where(eq(carePackages.id, parseInt(id))).returning()
  return 'ok'
}, {
  permission: 'careplan:write',
  requireAuth: true,
  hasParams: true
})

export const DELETE = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params

  // 先查询现有护理套餐信息
  const [currentPackage] = await db.select().from(carePackages).where(eq(carePackages.id, parseInt(id))).limit(1)
  if (!currentPackage) {
    throw new Error('护理套餐不存在')
  }

  // 权限校验：非超级管理员只能操作自己机构的护理套餐
  if (!context?.isSuperAdmin) {
    if (currentPackage.organizationId !== Number(context?.organizationId)) {
      throw new Error('无权限操作该护理套餐')
    }
  }

  await db.update(carePackages).set({
    deleted: true
  }).where(eq(carePackages.id, parseInt(id))).returning()

  return 'ok'
}, {
  permission: 'careplan:write',
  requireAuth: true,
  hasParams: true
})
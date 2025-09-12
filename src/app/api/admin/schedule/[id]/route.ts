import { NextRequest } from "next/server"
import { createHandler } from "../../../_utils/handler"
import { schedulePlanCreateSchema } from "@/lib/validations"
import { db } from "@/db"
import { schedulePlans } from "@/db/schema"
import { eq } from "drizzle-orm"

export const PUT = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params
  const data = await request.json()
  if (context?.isSuperAdmin) {
    if (!data.organizationId) {
      throw new Error('机构ID不能为空')
    }
  } else {
    data.organizationId = Number(context?.organizationId)
  }
  const [currentSchedulePlan] = await db.select().from(schedulePlans).where(eq(schedulePlans.id, parseInt(id))).limit(1)
  if (!currentSchedulePlan) {
    throw new Error('排班计划不存在')
  }

  // 权限校验：非超级管理员只能操作自己机构的排班计划
  if (!context?.isSuperAdmin) {
    if (currentSchedulePlan.organizationId !== Number(context?.organizationId)) {
      throw new Error('无权限操作该排班计划')
    }
  }
  const startTime = new Date(currentSchedulePlan.startTime)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0) // 设置为明天的开始时间
  if (startTime <= tomorrow) {
    throw new Error('以往的排班计划不允许修改！')
  }
  const dataParams = schedulePlanCreateSchema.safeParse(data)
  if (!dataParams.success) {
    throw new Error(dataParams.error.errors[0].message)
  }
  console.log(dataParams.data)
  await db.update(schedulePlans).set({
    ...dataParams.data,
    startTime: new Date(dataParams.data.startTime),
    endTime: new Date(dataParams.data.endTime)
  }).where(eq(schedulePlans.id, parseInt(id))).returning()
  return 'ok'
}, {
  permission: 'schedulingPlan:write',
  requireAuth: true,
  hasParams: true
})
export const DELETE = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params

  // 先查询排班计划是否存在
  const [currentSchedulePlan] = await db.select().from(schedulePlans).where(eq(schedulePlans.id, parseInt(id))).limit(1)
  if (!currentSchedulePlan) {
    throw new Error('排班计划不存在')
  }

  // 权限校验：非超级管理员只能操作自己机构的排班计划
  if (!context?.isSuperAdmin) {
    if (currentSchedulePlan.organizationId !== Number(context?.organizationId)) {
      throw new Error('无权限操作该排班计划')
    }
  }

  await db.update(schedulePlans).set({
    deleted: true
  }).where(eq(schedulePlans.id, parseInt(id))).returning()

  return 'ok'
}, {
  permission: 'schedulingPlan:write',
  requireAuth: true,
  hasParams: true
})
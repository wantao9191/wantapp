import { NextRequest } from "next/server"
import { createHandler } from "../../../_utils/handler"
import { schedulePlanCreateSchema } from "@/lib/validations"
import { db } from "@/db"
import { schedulePlans } from "@/db/schema"
import { eq } from "drizzle-orm"

export const PUT = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params
  const data = await request.json()
  const dataParams = schedulePlanCreateSchema.safeParse(data)
  if (!dataParams.success) {
    throw new Error(dataParams.error.errors[0].message)
  }
  const [schedulePlan] = await db.update(schedulePlans).set({
    ...dataParams.data,
    startTime: new Date(dataParams.data.startTime),
    endTime: new Date(dataParams.data.endTime)
  }).where(eq(schedulePlans.id, parseInt(id))).returning()
  if (!schedulePlan) {
    throw new Error('排班计划不存在')
  }
  return 'ok'
}, {
  permission: 'schedulingPlan:write',
  requireAuth: true,
  hasParams: true
})
export const DELETE = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params
  const [schedulePlan] = await db.update(schedulePlans).set({
    deleted: true
  }).where(eq(schedulePlans.id, parseInt(id))).returning()
  if (!schedulePlan) {
    throw new Error('排班计划不存在')
  }
  return 'ok'
}, {
  permission: 'schedulingPlan:write',
  requireAuth: true,
  hasParams: true
})
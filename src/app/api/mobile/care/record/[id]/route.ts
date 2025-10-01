import { createHandler, HandlerContext } from "@/app/api/_utils/handler"
import { NextRequest } from "next/server"
import { db } from "@/db"
import { careRecords, schedulePlans } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { CommonStatus } from "@/types/enums"

export const GET = createHandler(async (request: NextRequest, params: any, context?: HandlerContext) => {
  const { id } = params
  const whereConditions = [
    eq(schedulePlans.id, parseInt(id)),
    eq(schedulePlans.deleted, false),
    eq(schedulePlans.status, CommonStatus.ENABLED),
    eq(schedulePlans.organizationId, Number(context?.organizationId)),
  ]
  if (context?.userType === 'nurse') {
    whereConditions.push(eq(schedulePlans.nurseId, Number(context?.userId)))
  } else if (context?.userType === 'insured') {
    whereConditions.push(eq(schedulePlans.insuredId, Number(context?.userId)))
  }
  const [plan] = await db.select()
    .from(schedulePlans)
    .where(and(...whereConditions))
  if (!plan) {
    throw '排班计划不存在'
  }
  // 查询该排班计划对应的护理记录
  const [care] = await db.select()
    .from(careRecords)
    .where(and(
      eq(careRecords.schedulePlanId, parseInt(id)),
      eq(careRecords.deleted, false),
      eq(careRecords.organizationId, Number(context?.organizationId))
    ))

  if (!care) {
    throw '护理记录不存在'
  }

  return care
}, {
  requireAuth: true,
  hasParams: true
})
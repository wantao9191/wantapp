import { createHandler, HandlerContext } from "@/app/api/_utils/handler"
import { NextRequest } from "next/server"
import { db } from "@/db"
import { careRecords, schedulePlans } from "@/db/schema"
import { and, eq } from "drizzle-orm"

export const GET = createHandler(async (request: NextRequest, params: any, context?: HandlerContext) => {
  const { id } = params
  const recordId = parseInt(id)
  
  // 查询护理记录
  const [care] = await db.select()
    .from(careRecords)
    .where(and(
      eq(careRecords.id, recordId),
      eq(careRecords.deleted, false),
      eq(careRecords.organizationId, Number(context?.organizationId))
    ))

  if (!care) {
    throw '护理记录不存在'
  }

  // 验证关联的排班计划
  if (!care.schedulePlanId) {
    throw '护理记录未关联排班计划'
  }

  // 查询关联的排班计划信息
  const [plan] = await db.select()
    .from(schedulePlans)
    .where(and(
      eq(schedulePlans.id, care.schedulePlanId),
      eq(schedulePlans.deleted, false)
    ))

  if (!plan) {
    throw '关联的排班计划不存在'
  }

  // 权限验证：护理员只能查看自己的护理记录，参保人只能查看自己的护理记录
  if (context?.userType === 'nurse' && plan.nurseId !== Number(context?.userId)) {
    throw '无权查看该护理记录'
  } else if (context?.userType === 'insured' && plan.insuredId !== Number(context?.userId)) {
    throw '无权查看该护理记录'
  }

  return care
}, {
  requireAuth: true,
  hasParams: true
})
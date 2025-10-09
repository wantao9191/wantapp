import { createHandler, HandlerContext } from "@/app/api/_utils/handler"
import { NextRequest } from "next/server"
import { db } from "@/db"
import { careRecords, schedulePlans } from "@/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"
import dayjs from "dayjs"

export const GET = createHandler(async (request: NextRequest, context?: HandlerContext) => {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  const startTime = searchParams.get('startTime')
  const endTime = searchParams.get('endTime')
  
  const whereConditions = [
    eq(careRecords.deleted, false),
    eq(careRecords.organizationId, Number(context?.organizationId))
  ]
  
  if (status) {
    whereConditions.push(eq(careRecords.status, Number(status)))
  }

  // 根据关联的plan的时间范围过滤
  if (startTime) {
    const startDate = dayjs(startTime).startOf('day').toDate()
    whereConditions.push(gte(schedulePlans.startTime, startDate))
  }
  
  if (endTime) {
    const endDate = dayjs(endTime).endOf('day').toDate()
    whereConditions.push(lte(schedulePlans.endTime, endDate))
  }

  const results = await db
    .select({
      id: careRecords.id,
      schedulePlanId: careRecords.schedulePlanId,
      organizationId: careRecords.organizationId,
      signInTime: careRecords.signInTime,
      signOutTime: careRecords.signOutTime,
      signInLocation: careRecords.signInLocation,
      signOutLocation: careRecords.signOutLocation,
      signInPhoto: careRecords.signInPhoto,
      signOutPhoto: careRecords.signOutPhoto,
      description: careRecords.description,
      status: careRecords.status,
      alertStatus: careRecords.alertStatus,
      createTime: careRecords.createTime,
      deleted: careRecords.deleted,
    })
    .from(careRecords)
    .leftJoin(schedulePlans, eq(careRecords.schedulePlanId, schedulePlans.id))
    .where(and(...whereConditions))
  
  return results
}, {
  requireAuth: true,
  hasParams: true,
  source: 'mobile'  // 只允许移动端token
})
import { createHandler, HandlerContext } from "@/app/api/_utils/handler"
import { NextRequest } from "next/server"
import { db } from "@/db"
import { careRecords, schedulePlans } from "@/db/schema"
import { eq } from "drizzle-orm"
import { CareRecordStatus, CareRecordAlertStatus } from "@/types/enums"
import { ok } from "@/app/api/_utils/response"
import dayjs from "@/lib/dayjs-config"

export const POST = createHandler(async (request: NextRequest, params: any, context?: HandlerContext) => {
  const { id } = params
  const recordId = parseInt(id)
  const startServiceTime = new Date()

  // 验证用户类型
  if (context?.userType !== 'nurse') {
    throw '只有护理员才能开始服务'
  }

  // 查询护理记录
  const [careRecord] = await db.select().from(careRecords).where(eq(careRecords.id, recordId))

  if (!careRecord) {
    throw '护理记录不存在，无法开始服务，请联系管理员'
  }

  // 验证组织ID
  if (context?.organizationId && careRecord.organizationId !== context.organizationId) {
    throw '该护理记录不属于您的机构，无法开始服务'
  }

  // 检查是否已经开始服务
  if (careRecord.status === CareRecordStatus.IN_SERVICE) {
    throw '服务已开始，无需重复操作'
  }

  // 验证当前状态必须是已签到
  if (careRecord.status !== CareRecordStatus.SIGNED_IN) {
    throw '当前状态不允许开始服务，请先完成签到'
  }

  // 验证排班计划并校验时间范围
  let alertStatus = careRecord.alertStatus || CareRecordAlertStatus.NORMAL

  if (careRecord.schedulePlanId) {
    const [carePlan] = await db.select().from(schedulePlans).where(eq(schedulePlans.id, careRecord.schedulePlanId))

    if (!carePlan) {
      throw '排班计划不存在，无法开始服务，请联系管理员'
    }

    // 验证护理员身份
    if (!carePlan.nurseId) {
      throw '排班计划未分配护理员，请联系管理员'
    }

    if (carePlan.nurseId !== context?.userId) {
      throw '您不是该排班计划的护理员，无法开始服务'
    }

    // 验证时间范围
    if (carePlan.startTime && carePlan.endTime) {
      const planStartTime = dayjs(carePlan.startTime)
      const planEndTime = dayjs(carePlan.endTime)
      const currentTime = dayjs(startServiceTime)

      // 检查是否在计划时间范围内（允许前后30分钟的误差）
      const diffFromStart = currentTime.diff(planStartTime, 'minute')
      const diffFromEnd = currentTime.diff(planEndTime, 'minute')

      // 如果当前时间超过结束时间
      if (diffFromEnd > 0) {
        throw `开始服务时间已超过排班计划结束时间，无法开始服务。计划结束时间：${planEndTime.format('YYYY-MM-DD HH:mm')}`
      }

      // 如果当前时间早于开始时间超过30分钟
      if (diffFromStart < -30) {
        throw `开始服务时间早于计划开始时间30分钟以上，无法开始服务。计划开始时间：${planStartTime.format('YYYY-MM-DD HH:mm')}`
      }

      // 如果已有签到时间，检查开始服务时间是否在签到时间之后
      if (careRecord.signInTime) {
        const signInTime = dayjs(careRecord.signInTime)
        const diffFromSignIn = currentTime.diff(signInTime, 'minute')
        
        if (diffFromSignIn < 0) {
          throw '开始服务时间不能早于签到时间'
        }
      }

      // 记录时间验证信息
      console.log(`开始服务时间验证通过，距离计划开始时间 ${diffFromStart} 分钟`)
    }
  }

  // 更新护理记录：设置开始服务时间、状态和警告状态
  const [updatedRecord] = await db.update(careRecords).set({
    startServiceTime: startServiceTime,
    status: CareRecordStatus.IN_SERVICE,
    alertStatus: alertStatus,
  }).where(eq(careRecords.id, recordId)).returning()


  return ok(updatedRecord, '开始服务成功')
}, {
  requireAuth: true,
  hasParams: true,
  source: 'mobile'
})


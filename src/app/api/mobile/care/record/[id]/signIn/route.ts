import { createHandler, HandlerContext } from "@/app/api/_utils/handler"
import { NextRequest } from "next/server"
import { db } from "@/db"
import { careRecords, schedulePlans, personInfo } from "@/db/schema"
import { eq } from "drizzle-orm"
import { CareRecordStatus, CareRecordAlertStatus } from "@/types/enums"
import dayjs from "@/lib/dayjs-config"
import { careRecordSignInSchema } from "@/lib/validations"
import { validateSignInLocation } from "@/lib/geo-utils"
import { ok } from "@/app/api/_utils/response"
export const POST = createHandler(async (request: NextRequest, params: any, context?: HandlerContext) => {
  const { id } = params
  const recordId = parseInt(id)
  const signInTime = new Date()

  // 解析并验证请求体
  const body = await request.json()
  const validationResult = careRecordSignInSchema.safeParse(body)
  
  if (!validationResult.success) {
    console.log(validationResult.error)
    throw validationResult.error.errors[0].message
  }

  const {
    signInPhoto,
    signInLocationAddress,
    latitude,
    longitude,
    accuracy,
    timestamp,
    locationSource
  } = validationResult.data

  // 验证用户类型
  if (context?.userType !== 'nurse') {
    throw '只有护理员才能进行签到打卡操作'
  }

  // 查询护理记录
  const [careRecord] = await db.select().from(careRecords).where(eq(careRecords.id, recordId))

  if (!careRecord) {
    throw '护理记录不存在，无法签到打卡，请联系管理员'
  }

  // 验证组织ID
  if (context?.organizationId && careRecord.organizationId !== context.organizationId) {
    throw '该护理记录不属于您的机构，无法签到打卡'
  }

  if (careRecord.status !== CareRecordStatus.NOT_STARTED) {
    throw '已签到，无需重复签到打卡'
  }

  // 验证时间是否符合开始时间
  let alertStatus = CareRecordAlertStatus.NORMAL

  if (careRecord.schedulePlanId) {
    const [carePlan] = await db.select().from(schedulePlans).where(eq(schedulePlans.id, careRecord.schedulePlanId))

    if (!carePlan) {
      throw '排班计划不存在，无法签到打卡，请联系管理员'
    }

    if (!carePlan.startTime) {
      throw '排班计划缺少开始时间，请联系管理员'
    }

    // 验证护理员身份
    if (!carePlan.nurseId) {
      throw '排班计划未分配护理员，请联系管理员'
    }

    if (carePlan.nurseId !== context?.userId) {
      throw '您不是该排班计划的护理员，无法签到打卡'
    }

    // 获取参保人的位置信息用于地理围栏验证
    if (carePlan.insuredId) {
      const [insured] = await db.select().from(personInfo).where(eq(personInfo.id, carePlan.insuredId))
      
      if (!insured) {
        throw '未找到参保人信息，请联系管理员'
      }

      // 如果参保人有位置信息，进行地理围栏验证
      if (insured.latitude && insured.longitude) {
        // 坐标系说明：
        // 前端传来的是 GCJ-02 坐标（火星坐标系）
        // 数据库存储的也是 GCJ-02 坐标
        // 因此可以直接进行距离计算，无需转换
        
        const locationValidation = validateSignInLocation({
          signInLat: latitude,              // 前端 GCJ-02 纬度
          signInLon: longitude,             // 前端 GCJ-02 经度
          targetLat: insured.latitude,      // 数据库 GCJ-02 纬度
          targetLon: insured.longitude,     // 数据库 GCJ-02 经度
          timestamp,
          accuracy,
          maxDistance: 500,    // 允许500米范围内签到
          maxAgeMinutes: 5,    // 定位信息不能超过5分钟
          maxAccuracy: 100     // GPS精度不能超过100米误差
        })

        if (!locationValidation.isValid) {
          throw `签到位置验证失败：${locationValidation.errors.join('；')}`
        }

        // 记录验证通过的距离信息
        console.log(`签到位置验证通过，距离目标位置 ${locationValidation.distance} 米`)
      }
    }

    // 计算当前时间与计划开始时间的差值（分钟）
    const startTime = dayjs(carePlan.startTime)
    const currentTime = dayjs(signInTime)
    const diffMinutes = currentTime.diff(startTime, 'minute')

    // 如果超过开始时间30分钟，无法打卡
    if (diffMinutes > 30) {
      // throw `签到时间已超过计划开始时间30分钟，无法打卡。计划开始时间：${startTime.format('YYYY-MM-DD HH:mm')}`
      alertStatus = CareRecordAlertStatus.EARLY_SIGN_IN
    }

    // 如果在开始时间之前超过30分钟，也无法打卡
    if (diffMinutes < -30) {
      // throw `签到时间早于计划开始时间30分钟以上，无法打卡。计划开始时间：${startTime.format('YYYY-MM-DD HH:mm')}`
      alertStatus = CareRecordAlertStatus.EARLY_SIGN_IN
    }

    // 如果迟到（超过开始时间但在30分钟内），标记为迟到
    if (diffMinutes > 0) {
      alertStatus = CareRecordAlertStatus.LATE
    }
  }

  // 更新护理记录（包含位置信息）
  await db.update(careRecords).set({
    signInTime: signInTime,
    signInLocationAddress: signInLocationAddress,
    signInLocation: `${latitude},${longitude}`,
    signInPhoto: signInPhoto,
    status: CareRecordStatus.SIGNED_IN,
    alertStatus: alertStatus,
  }).where(eq(careRecords.id, recordId))

  const message = alertStatus === CareRecordAlertStatus.LATE ? '签到成功，但已迟到' : alertStatus === CareRecordAlertStatus.EARLY_SIGN_IN ? '签到成功，但已早到' : '签到成功'

  return ok({
    id: careRecord.id,
    schedulePlanId: careRecord.schedulePlanId,
    signInTime: signInTime,
    signInLocationAddress: signInLocationAddress,
    status: CareRecordStatus.SIGNED_IN,
    alertStatus: alertStatus
  }, message)
}, {
  requireAuth: true,
  hasParams: true,
  source: 'mobile'
})
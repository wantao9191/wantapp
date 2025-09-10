import { NextRequest } from "next/server"
import { createHandler } from "../../_utils/handler"
import { db } from "@/db"
import { schedulePlans, users, personInfo, carePackages, organizations } from "@/db/schema"
import { eq, and, gte, lt, like } from "drizzle-orm"
import { schedulePlanSchema, schedulePlanCreateSchema } from "@/lib/validations"

export const GET = createHandler(async (request: NextRequest, params, context) => {
  const { searchParams } = new URL(request.url)
  const nurseName = searchParams.get('nurseName') || ''
  const insuredName = searchParams.get('insuredName') || ''
  const month = searchParams.get('month') // 格式: YYYY-MM
  let organizationId = searchParams.get('organizationId')
  // 构建基础查询条件
  const whereConditions = [
    eq(schedulePlans.deleted, false),
    eq(schedulePlans.status, 1)
  ]

  const dataParams = schedulePlanSchema.safeParse({
    month,
    organizationId: organizationId ? parseInt(organizationId) : undefined,
    nurseName,
    insuredName
  })
  if (!dataParams.success) {
    throw new Error(dataParams.error.errors[0].message)
  }
  // 如果不是超级管理员，添加机构过滤条件
  if (context?.isSuperAdmin) {
    // 如果传入了机构ID参数，添加机构过滤条件
    if (dataParams.data.organizationId) {
      whereConditions.push(eq(schedulePlans.organizationId, dataParams.data.organizationId))
    }
  }

  // 如果传入了月份参数，添加月份过滤条件
  if (month) {
    // 验证月份格式 (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/
    if (!monthRegex.test(month)) {
      throw new Error('月份格式错误，请使用 YYYY-MM 格式')
    }

    // 计算月份的开始和结束时间
    const year = parseInt(month.split('-')[0])
    const monthNum = parseInt(month.split('-')[1])
    const startOfMonth = new Date(year, monthNum - 1, 1)
    const endOfMonth = new Date(year, monthNum, 1) // 下个月的第一天

    // 添加月份过滤条件：startTime 在指定月份内
    whereConditions.push(gte(schedulePlans.startTime, startOfMonth))
    whereConditions.push(lt(schedulePlans.startTime, endOfMonth))
  }

  // 如果传入了护士姓名，添加护士姓名过滤条件
  if (nurseName) {
    whereConditions.push(like(personInfo.name, `%${nurseName}%`))
  }

  // 如果传入了被保险人姓名，添加被保险人姓名过滤条件
  if (insuredName) {
    whereConditions.push(like(personInfo.name, `%${insuredName}%`))
  }

  // 构建查询，包含所有关联表的完整信息
  const data = await db
    .select({
      // 排班计划基本信息
      id: schedulePlans.id,
      startTime: schedulePlans.startTime,
      endTime: schedulePlans.endTime,
      duration: schedulePlans.duration,
      description: schedulePlans.description,
      status: schedulePlans.status,
      createTime: schedulePlans.createTime,
      deleted: schedulePlans.deleted,

      // 关联的机构完整信息
      organization: {
        id: organizations.id,
        name: organizations.name,
        status: organizations.status,
        address: organizations.address,
        phone: organizations.phone,
        email: organizations.email,
        operator: organizations.operator,
        setupTime: organizations.setupTime,
        description: organizations.description,
        createTime: organizations.createTime,
        deleted: organizations.deleted,
      },

      // 关联的护士完整信息
      nurse: {
        id: users.id,
        name: users.name,
        username: users.username,
        phone: users.phone,
        email: users.email,
        status: users.status,
        description: users.description,
        createTime: users.createTime,
        deleted: users.deleted,
      },

      // 关联的被保险人完整信息
      insured: {
        id: personInfo.id,
        name: personInfo.name,
        mobile: personInfo.mobile,
        credential: personInfo.credential,
        avatar: personInfo.avatar,
        organizationId: personInfo.organizationId,
        status: personInfo.status,
        description: personInfo.description,
        type: personInfo.type,
        createTime: personInfo.createTime,
        deleted: personInfo.deleted,
      },

      // 关联的护理套餐完整信息
      package: {
        id: carePackages.id,
        organizationId: carePackages.organizationId,
        minDuration: carePackages.minDuration,
        maxDuration: carePackages.maxDuration,
        name: carePackages.name,
        tasks: carePackages.tasks,
        description: carePackages.description,
        status: carePackages.status,
        createTime: carePackages.createTime,
        deleted: carePackages.deleted,
      },
    })
    .from(schedulePlans)
    .leftJoin(organizations, eq(schedulePlans.organizationId, organizations.id))
    .leftJoin(users, eq(schedulePlans.nurseId, users.id))
    .leftJoin(personInfo, eq(schedulePlans.insuredId, personInfo.id))
    .leftJoin(carePackages, eq(schedulePlans.packageId, carePackages.id))
    .where(and(...whereConditions))

  return data
}, {
  permission: 'schedulingPlan:read',
  requireAuth: true,
})

export const POST = createHandler(async (request: NextRequest, params, context) => {
  const data = await request.json()
  if (context?.isSuperAdmin) {
    data.organizationId = context.organizationId
  } else {
    data.organizationId = context?.organizationId ?? undefined
  }
  const dataParams = schedulePlanCreateSchema.safeParse(data)
  if (!dataParams.success) {
    throw new Error(dataParams.error.errors[0].message)
  }
  // 转换数据类型以匹配数据库模式
  const insertData = {
    ...dataParams.data,
    startTime: new Date(dataParams.data.startTime),
    endTime: new Date(dataParams.data.endTime),
    duration: parseInt(dataParams.data.duration),
  }
  await db.insert(schedulePlans).values(insertData).returning()
  return 'ok'
}, {
  permission: 'schedulingPlan:write',
  requireAuth: true,
})
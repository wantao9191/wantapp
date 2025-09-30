import { NextRequest } from "next/server"
import { createHandler, HandlerContext } from "../../_utils/handler"
import { db } from "@/db"
import { careRecords, schedulePlans, personInfo, carePackages, organizations, careTasks } from "@/db/schema"
import { eq, and, count } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { pageSchema, careRecordSchema } from "@/lib/validations"
import { paginatedSimple } from "../../_utils/response"
import { CareRecordStatusLabels,CareRecordAlertStatusLabels } from "@/types/enums"

export const GET = createHandler(async (request: NextRequest, context?: HandlerContext) => {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '1'
  const pageSize = searchParams.get('pageSize') || '10'
  const pageParams = pageSchema.safeParse({ page: Number(page), pageSize: Number(pageSize) })

  if (!pageParams.success) {
    throw new Error(pageParams.error.errors[0].message)
  }

  let organizationId = Number(searchParams.get('organizationId'))
  const signInTime = searchParams.get('signInTime') || ''
  const signOutTime = searchParams.get('signOutTime') || ''
  const status = searchParams.get('status') || ''
  const alertStatus = searchParams.get('alertStatus') || ''

  if (!context?.isSuperAdmin) {
    organizationId = Number(context?.organizationId)
  }
  const dataParams = careRecordSchema.safeParse({
    organizationId,
    signInTime,
    signOutTime
  })
  if (!dataParams.success) {
    throw new Error(dataParams.error.errors[0].message)
  }
  const whereConditions = [
    eq(careRecords.deleted, false),
    eq(careRecords.organizationId, dataParams.data.organizationId),
  ]

  if (status) {
    whereConditions.push(eq(careRecords.status, Number(status)))
  }
  if (alertStatus) {
    whereConditions.push(eq(careRecords.alertStatus, Number(alertStatus)))
  }
  if (dataParams.data.signInTime) {
    whereConditions.push(eq(careRecords.signInTime, new Date(dataParams.data.signInTime)))
  }
  if (dataParams.data.signOutTime) {
    whereConditions.push(eq(careRecords.signOutTime, new Date(dataParams.data.signOutTime)))
  }

  // 定义别名
  const nurseInfo = alias(personInfo, 'nurseInfo')
  const insuredInfo = alias(personInfo, 'insuredInfo')

  // 查询护理记录及关联信息
  const contents = await db
    .select({
      // 护理记录基本信息
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

      // 关联的排班计划信息
      schedulePlan: {
        id: schedulePlans.id,
        startTime: schedulePlans.startTime,
        endTime: schedulePlans.endTime,
        duration: schedulePlans.duration,
        description: schedulePlans.description,
        status: schedulePlans.status,
        createTime: schedulePlans.createTime,

        // 关联的机构信息
        organization: {
          id: organizations.id,
          // @ts-expect-error - Drizzle ORM 嵌套别名类型推断问题
          name: organizations.name,
          status: organizations.status,
          address: organizations.address,
          phone: organizations.phone,
          email: organizations.email,
          operator: organizations.operator,
          setupTime: organizations.setupTime,
          description: organizations.description,
          createTime: organizations.createTime,
        },

        // 关联的护士信息
        nurse: {
          id: nurseInfo.id,
          // @ts-expect-error - Drizzle ORM 嵌套别名类型推断问题
          name: nurseInfo.name,
          username: nurseInfo.username,
          mobile: nurseInfo.mobile,
          gender: nurseInfo.gender,
          birthDate: nurseInfo.birthDate,
          age: nurseInfo.age,
          description: nurseInfo.description,
          createTime: nurseInfo.createTime,
          type: nurseInfo.type,
          credential: nurseInfo.credential,
        },

        // 关联的被保险人信息
        insured: {
          id: insuredInfo.id,
          // @ts-expect-error - Drizzle ORM 嵌套别名类型推断问题
          name: insuredInfo.name,
          mobile: insuredInfo.mobile,
          credential: insuredInfo.credential,
          gender: insuredInfo.gender,
          birthDate: insuredInfo.birthDate,
          age: insuredInfo.age,
          address: insuredInfo.address,
          avatar: insuredInfo.avatar,
          organizationId: insuredInfo.organizationId,
          description: insuredInfo.description,
          type: insuredInfo.type,
          createTime: insuredInfo.createTime,
        },

        // 关联的护理套餐信息
        package: {
          id: carePackages.id,
          organizationId: carePackages.organizationId,
          minDuration: carePackages.minDuration,
          maxDuration: carePackages.maxDuration,
          // @ts-expect-error - Drizzle ORM 嵌套别名类型推断问题
          name: carePackages.name,
          tasks: carePackages.tasks,
          description: carePackages.description,
          createTime: carePackages.createTime,
        },
      },
    })
    .from(careRecords)
    .leftJoin(schedulePlans, eq(careRecords.schedulePlanId, schedulePlans.id))
    .leftJoin(organizations, eq(schedulePlans.organizationId, organizations.id))
    .leftJoin(insuredInfo, eq(schedulePlans.insuredId, insuredInfo.id))
    .leftJoin(nurseInfo, eq(schedulePlans.nurseId, nurseInfo.id))
    .leftJoin(carePackages, eq(schedulePlans.packageId, carePackages.id))
    .where(and(...whereConditions))
    .limit(pageParams.data.pageSize)
    .offset((pageParams.data.page - 1) * pageParams.data.pageSize)
    .orderBy(careRecords.createTime)

  // 查询总数
  const totalResult = await db.select({ count: count() }).from(careRecords).where(and(...whereConditions))

  // 转换枚举值为标签
  const transformedContents = contents.map(item => ({
    ...item,
    status: CareRecordStatusLabels[((item.status as number) ?? 0) as keyof typeof CareRecordStatusLabels],
    alertStatus: CareRecordAlertStatusLabels[((item.alertStatus as number) ?? 0) as keyof typeof CareRecordAlertStatusLabels],
  }))

  const total = totalResult[0]?.count || 0
  return paginatedSimple(transformedContents, pageParams.data.page, pageParams.data.pageSize, total)
}, {
  permission: 'schedulingRecord:read',
  requireAuth: true
})

/**
 * 增强护理套餐的任务信息，将任务 ID 转换为任务名称
 */
async function enrichPackageTasks(contents: any[]) {
  // 获取所有相关的 careTasks 信息
  const taskIds = [...new Set(contents.flatMap(item => 
    item.schedulePlan?.package?.tasks || []
  ))]

  let taskMap: Record<number, string> = {}
  if (taskIds.length > 0) {
    const tasks = await db.select({
      id: careTasks.id,
      name: careTasks.name
    })
      .from(careTasks)
      .where(and(
        eq(careTasks.deleted, false),
        eq(careTasks.status, 1)
      ))

    taskMap = tasks.reduce((acc, task) => {
      acc[task.id] = task.name
      return acc
    }, {} as Record<number, string>)
  }

  // 为每个 carePackage 添加 tasks 名称
  return contents.map(item => {
    if (item.schedulePlan?.package?.tasks) {
      return {
        ...item,
        schedulePlan: {
          ...item.schedulePlan,
          package: {
            ...item.schedulePlan.package,
            tasks: item.schedulePlan.package.tasks.map((taskId: number) => 
              taskMap[taskId] || `任务${taskId}`
            )
          }
        }
      }
    }
    return item
  })
}  
import { NextRequest } from 'next/server'
import { createHandler, HandlerContext } from '@/app/api/_utils/handler'
import { personInfo, schedulePlans, organizations, carePackages, careTasks } from '@/db/schema'
import { db } from '@/db'
import { eq, gte, lte, and } from 'drizzle-orm'
import { alias } from "drizzle-orm/pg-core"
import dayjs from 'dayjs'

export const GET = createHandler(async (request: NextRequest, context?: HandlerContext) => {
  const [user] = await db.select().from(personInfo).where(eq(personInfo.id, Number(context?.userId)))
  if (!user) {
    throw '用户不存在'
  }
  const todayStart = dayjs().startOf('month').toDate()
  const todayEnd = dayjs().endOf('month').toDate()
  const withCredentials = [
    eq(schedulePlans.organizationId, Number(context?.organizationId)),
    eq(schedulePlans.deleted, false),
    eq(schedulePlans.status, 1),
    gte(schedulePlans.startTime, todayStart),
    lte(schedulePlans.endTime, todayEnd)
  ]

  if (user.type === 'insured') {
    withCredentials.push(eq(schedulePlans.insuredId, user.id))
  } else if (user.type === 'nurse') {
    withCredentials.push(eq(schedulePlans.nurseId, user.id))
  }
  const nurseInfo = alias(personInfo, 'nurseInfo')
  const insuredInfo = alias(personInfo, 'insuredInfo')
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
        id: nurseInfo.id,
        name: nurseInfo.name,
        username: nurseInfo.username,
        mobile: nurseInfo.mobile,
        gender: nurseInfo.gender,
        birthDate: nurseInfo.birthDate,
        age: nurseInfo.age,
        description: nurseInfo.description,
        createTime: nurseInfo.createTime,
        type: nurseInfo.type,
      },

      // 关联的被保险人完整信息
      insured: {
        id: insuredInfo.id,
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

      // 关联的护理套餐完整信息
      package: {
        id: carePackages.id,
        organizationId: carePackages.organizationId,
        minDuration: carePackages.minDuration,
        maxDuration: carePackages.maxDuration,
        name: carePackages.name,
        tasks: carePackages.tasks,
        description: carePackages.description,
        createTime: carePackages.createTime
      },
    })
    .from(schedulePlans)
    .leftJoin(organizations, eq(schedulePlans.organizationId, organizations.id))
    .leftJoin(insuredInfo, eq(schedulePlans.insuredId, insuredInfo.id))
    .leftJoin(nurseInfo, eq(schedulePlans.nurseId, nurseInfo.id))
    .leftJoin(carePackages, eq(schedulePlans.packageId, carePackages.id))
    .where(and(...withCredentials)).orderBy(schedulePlans.startTime)
  const enrichedData = await createContent(data)
  return enrichedData
}, {
  permission: 'user:read',
  requireAuth: true,
  source: 'mobile'  // 只允许移动端token
})
const createContent = async (contents: any[]) => {
  // 获取所有相关的 careTasks 信息
  const taskIds = [...new Set(contents.flatMap(item => item.package.tasks || []))]

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
  const contentsWithTaskNames = contents.map(item => {
    return {
      ...item,
      package: {
        ...item.package,
        tasks: (item.package.tasks || []).map((taskId: number) => taskMap[taskId] || `任务${taskId}`)
      }
    }
  })
  return contentsWithTaskNames
}   
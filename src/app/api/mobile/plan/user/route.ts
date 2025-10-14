import { NextRequest } from 'next/server'
import { createHandler, HandlerContext } from '@/app/api/_utils/handler'
import { enrichPackagesWithTaskNames } from '@/app/api/_utils/tasks-helper'
import { personInfo, schedulePlans, organizations, carePackages, careRecords } from '@/db/schema'
import { db } from '@/db'
import { eq, gte, lte, and } from 'drizzle-orm'
import { alias } from "drizzle-orm/pg-core"
import dayjs from 'dayjs'

export const GET = createHandler(async (request: NextRequest, context?: HandlerContext) => {
  const searchParams = request.nextUrl.searchParams
  const startTime = searchParams.get('startTime')
  const endTime = searchParams.get('endTime')
  const recordStatus = searchParams.get('recordStatus') // 护理记录状态过滤参数
  const todayStart = startTime ? dayjs(startTime).startOf('day').toDate() : dayjs().startOf('day').toDate()
  const todayEnd = endTime ? dayjs(endTime).endOf('day').toDate() : dayjs().endOf('day').toDate()
  const withCredentials = [
    eq(schedulePlans.organizationId, Number(context?.organizationId)),
    eq(schedulePlans.deleted, false),
    eq(schedulePlans.status, 1),
    gte(schedulePlans.startTime, todayStart),
    lte(schedulePlans.endTime, todayEnd)
  ]

  if (context?.userType === 'insured') {
    withCredentials.push(eq(schedulePlans.insuredId, context?.userId))
  } else if (context?.userType === 'nurse') {
    withCredentials.push(eq(schedulePlans.nurseId, context?.userId))
  }

  // 如果指定了护理记录状态，添加过滤条件
  if (recordStatus !== null && recordStatus !== undefined && recordStatus !== '') {
    withCredentials.push(eq(careRecords.status, Number(recordStatus)))
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

      // 关联的护理记录完整信息（移动端需要显示执行状态和详细信息）
      record: {
        id: careRecords.id,
        schedulePlanId: careRecords.schedulePlanId,
        startServiceTime: careRecords.startServiceTime,
        endServiceTime: careRecords.endServiceTime,
        signInTime: careRecords.signInTime,
        signOutTime: careRecords.signOutTime,
        signInLocation: careRecords.signInLocation,
        signInLocationAddress: careRecords.signInLocationAddress,
        signOutLocation: careRecords.signOutLocation,
        signOutLocationAddress: careRecords.signOutLocationAddress,
        signInPhoto: careRecords.signInPhoto,
        signOutPhoto: careRecords.signOutPhoto,
        description: careRecords.description,
        alertStatus: careRecords.alertStatus,
        status: careRecords.status,
      },
    })
    .from(schedulePlans)
    .leftJoin(organizations, eq(schedulePlans.organizationId, organizations.id))
    .leftJoin(insuredInfo, eq(schedulePlans.insuredId, insuredInfo.id))
    .leftJoin(nurseInfo, eq(schedulePlans.nurseId, nurseInfo.id))
    .leftJoin(carePackages, eq(schedulePlans.packageId, carePackages.id))
    .leftJoin(careRecords, and(
      eq(careRecords.schedulePlanId, schedulePlans.id),
      eq(careRecords.deleted, false)
    ))
    .where(and(...withCredentials)).orderBy(schedulePlans.startTime)

  // 使用统一的工具函数添加任务名称
  const enrichedData = await enrichPackagesWithTaskNames(data)
  return enrichedData
}, {
  permission: 'user:read',
  requireAuth: true,
  source: 'mobile'  // 只允许移动端token
})   
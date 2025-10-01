import { NextRequest } from 'next/server'
import { createHandler, HandlerContext } from '@/app/api/_utils/handler'
import { enrichPackageWithTaskNames } from '@/app/api/_utils/tasks-helper'
import { personInfo, schedulePlans, organizations, carePackages } from '@/db/schema'
import { db } from '@/db'
import { eq, and } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

export const GET = createHandler(async (request: NextRequest, params: any, context?: HandlerContext) => {
  const { id } = params
  const planId = parseInt(id)

  if (isNaN(planId)) {
    throw new Error('无效的排班计划ID')
  }

  const nurseInfo = alias(personInfo, 'nurseInfo')
  const insuredInfo = alias(personInfo, 'insuredInfo')

  // 构建查询条件
  const whereConditions = [
    eq(schedulePlans.id, planId),
    eq(schedulePlans.deleted, false),
    eq(schedulePlans.status, 1),
    eq(schedulePlans.organizationId, Number(context?.organizationId))
  ]

  // 根据用户类型添加权限过滤
  if (context?.userType === 'insured') {
    whereConditions.push(eq(schedulePlans.insuredId, context?.userId))
  } else if (context?.userType === 'nurse') {
    whereConditions.push(eq(schedulePlans.nurseId, context?.userId))
  }

  // 查询排班计划详情，包含所有关联信息
  const [plan] = await db
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
    .where(and(...whereConditions))
    .limit(1)

  if (!plan) {
    throw new Error('排班计划不存在或无权访问')
  }

  // 使用统一的工具函数添加任务名称
  const enrichedPlan = await enrichPackageWithTaskNames(plan)

  return enrichedPlan
}, {
  permission: 'user:read',
  requireAuth: true,
  hasParams: true,
  source: 'mobile'  // 只允许移动端token
})
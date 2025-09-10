import { NextRequest } from "next/server"
import { createHandler, HandlerContext } from "../../_utils/handler"
import { db } from "@/db"
import { personInfo, organizations, carePackages } from "@/db/schema"
import type { NewPersonInfo } from "@/types/database"
import { eq, like, and, count, inArray } from "drizzle-orm"
import { paginatedSimple } from "../../_utils/response"
import { pageSchema, insuredSchema } from "@/lib/validations"
import bcrypt from 'bcryptjs'
import { getAgeFromIdCard, getGenderFromIdCard, getBirthDateFromIdCard } from "@/lib/utils"

// 常量定义
const DEFAULT_PASSWORD = '12345@Aa'
const DEFAULT_PAGE_SIZE = 10
const DEFAULT_PAGE = 1
const DEFAULT_TYPE = 'insured'
export const GET = createHandler(async (request: NextRequest, params, context) => {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') || ''
  const status = searchParams.get('status') || ''
  const page = searchParams.get('page') || DEFAULT_PAGE.toString()
  const pageSize = searchParams.get('pageSize') || DEFAULT_PAGE_SIZE.toString()
  
  // 参数验证
  const pageParams = pageSchema.safeParse({ 
    page: Number(page), 
    pageSize: Number(pageSize) 
  })
  if (!pageParams.success) {
    throw new Error(pageParams.error.errors[0].message)
  }

  // 构建查询条件
  const whereConditions = [
    eq(personInfo.deleted, false), 
    eq(personInfo.type, DEFAULT_TYPE)
  ]
  
  // 如果不是超级管理员，添加机构过滤条件
  if (context && !context.isSuperAdmin && context.organizationId) {
    whereConditions.push(eq(personInfo.organizationId, context.organizationId))
  }
  
  if (name) {
    whereConditions.push(like(personInfo.name, `%${name}%`))
  }
  
  if (status) {
    const statusNum = Number(status)
    if (isNaN(statusNum)) {
      throw new Error('状态参数必须是数字')
    }
    whereConditions.push(eq(personInfo.status, statusNum))
  }

  // 使用 JOIN 查询一次性获取所有数据
  const [contents, totalResult] = await Promise.all([
    db
      .select({
        id: personInfo.id,
        name: personInfo.name,
        username: personInfo.username,
        mobile: personInfo.mobile,
        gender: personInfo.gender,
        age: personInfo.age,
        address: personInfo.address,
        credential: personInfo.credential,
        avatar: personInfo.avatar,
        organizationId: personInfo.organizationId,
        type: personInfo.type,
        description: personInfo.description,
        status: personInfo.status,
        createTime: personInfo.createTime,
        deleted: personInfo.deleted,
        packageId: personInfo.packageId,
        birthDate: personInfo.birthDate,
        organizationName: organizations.name,
        packageName: carePackages.name,
      })
      .from(personInfo)
      .leftJoin(organizations, eq(personInfo.organizationId, organizations.id))
      .leftJoin(carePackages, eq(personInfo.packageId, carePackages.id))
      .where(and(...whereConditions))
      .limit(pageParams.data.pageSize)
      .offset((pageParams.data.page - 1) * pageParams.data.pageSize)
      .orderBy(personInfo.createTime),
    db
      .select({ count: count() })
      .from(personInfo)
      .where(and(...whereConditions))
  ])

  const total = totalResult[0]?.count || 0
  return paginatedSimple(contents, pageParams.data.page, pageParams.data.pageSize, total)
}, {
  permission: 'insured:read',
  requireAuth: true
})

export const POST = createHandler(async (request: NextRequest, context?: HandlerContext) => {
  const data = await request.json()

  // 处理机构ID逻辑
  if (context?.isSuperAdmin) {
    if (!data.organizationId) {
      throw new Error('机构ID不能为空')
    }
  } else {
    if (!context?.organizationId) {
      throw new Error('用户机构信息缺失')
    }
    data.organizationId = Number(context.organizationId)
  }

  // 数据验证
  const dataParams = insuredSchema.safeParse({ ...data, type: DEFAULT_TYPE })
  if (!dataParams.success) {
    throw new Error(dataParams.error.errors[0].message)
  }

  // 从身份证号提取信息
  const { credential, mobile } = dataParams.data
  const age = getAgeFromIdCard(credential)
  const gender = getGenderFromIdCard(credential)
  const birthDate = getBirthDateFromIdCard(credential)

  // 构建插入数据
  const insertData: NewPersonInfo = {
    ...dataParams.data,
    username: `user-${mobile}`,
    password: await bcrypt.hash(DEFAULT_PASSWORD, 10),
    gender: gender || '',
    age: age || 0,
    birthDate: birthDate || null,
  }

  await db.insert(personInfo).values(insertData).returning()
  return { message: '创建成功' }
}, {
  permission: 'insured:write',
  requireAuth: true
})
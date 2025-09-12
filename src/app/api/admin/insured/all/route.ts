import { NextRequest } from "next/server"
import { createHandler } from "../../../_utils/handler"
import { db } from "@/db"
import { personInfo, organizations, carePackages, careTasks } from "@/db/schema"
import { eq, like, and, count, inArray } from "drizzle-orm"
import { paginatedSimple } from "../../../_utils/response"
import { pageSchema, } from "@/lib/validations"

// 常量定义
const DEFAULT_PAGE_SIZE = 10
const DEFAULT_PAGE = 1
const DEFAULT_TYPE = 'insured'

export const GET = createHandler(async (request: NextRequest, params, context) => {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') || ''
  const page = searchParams.get('page') || DEFAULT_PAGE.toString()
  const pageSize = searchParams.get('pageSize') || DEFAULT_PAGE_SIZE.toString()
  const organizationId = searchParams.get('organizationId')
  // 参数验证
  const pageParams = pageSchema.safeParse({
    page: Number(page),
    pageSize: Number(pageSize),
  })
  if (!pageParams.success) {
    throw new Error(pageParams.error.errors[0].message)
  }

  // 构建查询条件
  const whereConditions = [
    eq(personInfo.deleted, false),
    eq(personInfo.type, DEFAULT_TYPE),
    eq(personInfo.status, 1)
  ]

  // 如果不是超级管理员，添加机构过滤条件
  if (context?.isSuperAdmin) {
    // 如果传入了机构ID参数，添加机构过滤条件
    if (organizationId) {
      whereConditions.push(eq(personInfo.organizationId, parseInt(organizationId)))
    }
  }
  if (name) {
    whereConditions.push(like(personInfo.name, `%${name}%`))
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
        birthDate: personInfo.birthDate,
        organizationName: organizations.name,
        // 关联的护理套餐信息
        package: {
          id: carePackages.id,
          organizationId: carePackages.organizationId,
          minDuration: carePackages.minDuration,
          maxDuration: carePackages.maxDuration,
          name: carePackages.name,
          description: carePackages.description,
          status: carePackages.status,
          createTime: carePackages.createTime,
          deleted: carePackages.deleted,
          tasks: carePackages.tasks, // JSON 字段，包含任务 ID 数组
        },
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
  const enrichedContents = await cretateContent(contents)
  return paginatedSimple(enrichedContents, pageParams.data.page, pageParams.data.pageSize, total)
}, {
  permission: 'insured:read',
  requireAuth: true
})

export const cretateContent = async (contents: any[]) => {
  // 收集所有任务 ID
  const allTaskIds = contents.flatMap(item => item.package?.tasks || []).filter((arr, index, self) => self.indexOf(arr) === index)

  // 批量查询任务详情
  let taskDetails: Record<number, any> = {}
  if (allTaskIds.length > 0) {
    const tasks = await db
      .select()
      .from(careTasks)
      .where(
        and(
          inArray(careTasks.id, Array.from(allTaskIds)),
          eq(careTasks.deleted, false),
          eq(careTasks.status, 1)
        )
      )

    // 转换为映射对象
    taskDetails = tasks.reduce((acc, task) => {
      acc[task.id] = task
      return acc
    }, {} as Record<number, any>)
  }

  // 为每个套餐补充任务详情
  return contents.map(item => ({
    ...item,
    package: item.package ? {
      ...item.package,
      tasks: item.package.tasks && Array.isArray(item.package.tasks)
        ? item.package.tasks.map((taskId: number) => taskDetails[taskId]).filter(Boolean)
        : []
    } : null
  }))
}

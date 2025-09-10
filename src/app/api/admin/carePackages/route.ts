import { NextRequest } from "next/server"
import { createHandler, HandlerContext } from "../../_utils/handler"
import { db } from "@/db"
import { carePackages, careTasks } from "@/db/schema"
import { eq, and, count, like } from "drizzle-orm"
import { pageSchema, carePackageSchema } from "@/lib/validations"
import { paginatedSimple } from "../../_utils/response"
export const GET = createHandler(async (request: NextRequest, context?: HandlerContext) => {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '1'
  const pageSize = searchParams.get('pageSize') || '10'
  const name = searchParams.get('name') || ''
  const status = searchParams.get('status')
  const pageParams = pageSchema.safeParse({ page: Number(page), pageSize: Number(pageSize) })
  if (!pageParams.success) {
    throw new Error(pageParams.error.errors[0].message)
  }
  const whereConditions = [eq(carePackages.deleted, false)]

  // 如果不是超级管理员，添加机构过滤条件
  if (context && !context.isSuperAdmin && context.organizationId) {
    whereConditions.push(eq(carePackages.organizationId, context.organizationId))
  }

  if (name) {
    whereConditions.push(like(carePackages.name, `%${name}%`))
  }
  if (status) {
    whereConditions.push(eq(carePackages.status, Number(status)))
  }
  const [contents, totalResult] = await Promise.all([
    db.select({
      id: carePackages.id,
      name: carePackages.name,
      minDuration: carePackages.minDuration,
      maxDuration: carePackages.maxDuration,
      tasks: carePackages.tasks,
      description: carePackages.description,
      status: carePackages.status,
      createTime: carePackages.createTime
    })
      .from(carePackages)
      .where(and(...whereConditions))
      .limit(pageParams.data.pageSize)
      .offset((pageParams.data.page - 1) * pageParams.data.pageSize)
      .orderBy(carePackages.createTime),
    db.select({ count: count() }).from(carePackages).where(and(...whereConditions))
  ])

  // 获取所有相关的 careTasks 信息
  const taskIds = contents.flatMap(item => item.tasks || [])
  const uniqueTaskIds = [...new Set(taskIds)]
  
  let taskMap: Record<number, string> = {}
  if (uniqueTaskIds.length > 0) {
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
  const contentsWithTaskNames = contents.map(item => ({
    ...item,
    taskNames: (item.tasks || []).map((taskId: number) => taskMap[taskId] || `任务${taskId}`)
  }))
  return paginatedSimple(contentsWithTaskNames, pageParams.data.page, pageParams.data.pageSize, totalResult[0]?.count || 0)
}, {
  permission: 'careplan:read',
  requireAuth: true
})

export const POST = createHandler(async (request: NextRequest, context?: HandlerContext) => {
  const data = await request.json()
  if (context?.isSuperAdmin) {
    throw new Error('超级管理员无权操作该护理套餐')
  } else {
    data.organizationId = Number(context?.organizationId)
  }
  const params = carePackageSchema.safeParse(data)
  if (!params.success) {
    throw new Error(params.error.errors[0].message)
  }
  await db.insert(carePackages).values(params.data).returning()
  return 'ok'
}, {
  permission: 'careplan:write',
  requireAuth: true
})

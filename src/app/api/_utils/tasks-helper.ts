import { db } from '@/db'
import { careTasks } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * 任务ID到任务名称的映射类型
 */
export type TaskMap = Record<number, string>

/**
 * 获取任务ID到任务名称的映射
 * @param taskIds 任务ID数组
 * @returns 任务ID到任务名称的映射对象
 */
export async function getTaskMap(taskIds: number[]): Promise<TaskMap> {
  if (taskIds.length === 0) {
    return {}
  }

  const tasks = await db
    .select({
      id: careTasks.id,
      name: careTasks.name
    })
    .from(careTasks)
    .where(and(
      eq(careTasks.deleted, false),
      eq(careTasks.status, 1)
    ))

  return tasks.reduce((acc, task) => {
    acc[task.id] = task.name
    return acc
  }, {} as TaskMap)
}

/**
 * 将任务ID数组转换为任务名称数组
 * @param taskIds 任务ID数组
 * @param taskMap 任务映射对象（可选，如果不提供会自动查询）
 * @returns 任务名称数组
 */
export async function convertTaskIdsToNames(
  taskIds: number[],
  taskMap?: TaskMap
): Promise<string[]> {
  if (taskIds.length === 0) {
    return []
  }

  const map = taskMap || await getTaskMap(taskIds)
  return taskIds.map(taskId => map[taskId] || `任务${taskId}`)
}

/**
 * 为包含tasks字段的单个对象添加任务名称
 * @param item 包含tasks字段的对象
 * @param taskMap 任务映射对象（可选）
 * @returns 添加了任务名称的对象
 */
export async function enrichItemWithTaskNames<T extends { tasks?: number[] | null }>(
  item: T,
  taskMap?: TaskMap
): Promise<T & { tasks: string[] }> {
  const taskIds = item.tasks || []
  const map = taskMap || await getTaskMap(taskIds)
  
  return {
    ...item,
    tasks: taskIds.map(taskId => map[taskId] || `任务${taskId}`)
  }
}

/**
 * 为包含tasks字段的对象数组批量添加任务名称
 * @param items 包含tasks字段的对象数组
 * @returns 添加了任务名称的对象数组
 */
export async function enrichItemsWithTaskNames<T extends { tasks?: number[] | null }>(
  items: T[]
): Promise<Array<T & { tasks: string[] }>> {
  if (items.length === 0) {
    return []
  }

  // 收集所有唯一的任务ID
  const taskIds = [...new Set(items.flatMap(item => item.tasks || []))]
  
  // 一次性获取所有任务映射
  const taskMap = await getTaskMap(taskIds)

  // 批量转换
  return items.map(item => ({
    ...item,
    tasks: (item.tasks || []).map(taskId => taskMap[taskId] || `任务${taskId}`)
  }))
}

/**
 * 为嵌套的package对象添加任务名称
 * 适用于排班计划等包含package.tasks的场景
 */
export async function enrichPackageWithTaskNames<T extends { package?: { tasks?: number[] | null } | null }>(
  item: T,
  taskMap?: TaskMap
): Promise<T> {
  if (!item.package?.tasks) {
    return item
  }

  const taskIds = item.package.tasks
  const map = taskMap || await getTaskMap(taskIds)

  return {
    ...item,
    package: {
      ...item.package,
      tasks: taskIds.map(taskId => map[taskId] || `任务${taskId}`)
    }
  }
}

/**
 * 为包含package.tasks的对象数组批量添加任务名称
 * 适用于排班计划列表等场景
 */
export async function enrichPackagesWithTaskNames<T extends { package?: { tasks?: number[] | null } | null }>(
  items: T[]
): Promise<T[]> {
  if (items.length === 0) {
    return []
  }

  // 收集所有唯一的任务ID
  const taskIds = [...new Set(items.flatMap(item => item.package?.tasks || []))]
  
  // 一次性获取所有任务映射
  const taskMap = await getTaskMap(taskIds)

  // 批量转换
  return items.map(item => {
    if (!item.package?.tasks) {
      return item
    }

    return {
      ...item,
      package: {
        ...item.package,
        tasks: (item.package.tasks || []).map(taskId => taskMap[taskId] || `任务${taskId}`)
      }
    }
  })
}

/**
 * 为深度嵌套的schedulePlan.package.tasks添加任务名称
 * 适用于护理记录等场景
 */
export async function enrichSchedulePlanPackageWithTaskNames<
  T extends { schedulePlan?: { package?: { tasks?: number[] | null } | null } | null }
>(items: T[]): Promise<T[]> {
  if (items.length === 0) {
    return []
  }

  // 收集所有唯一的任务ID
  const taskIds = [...new Set(items.flatMap(item => 
    item.schedulePlan?.package?.tasks || []
  ))]
  
  // 一次性获取所有任务映射
  const taskMap = await getTaskMap(taskIds)

  // 批量转换
  return items.map(item => {
    if (!item.schedulePlan?.package?.tasks) {
      return item
    }

    return {
      ...item,
      schedulePlan: {
        ...item.schedulePlan,
        package: {
          ...item.schedulePlan.package,
          tasks: (item.schedulePlan.package.tasks || []).map(
            taskId => taskMap[taskId] || `任务${taskId}`
          )
        }
      }
    }
  })
}


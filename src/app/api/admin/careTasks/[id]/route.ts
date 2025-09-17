import { NextRequest } from "next/server"
import { createHandler } from "../../../_utils/handler"
import { careTaskSchema } from "@/lib/validations"
import { db } from "@/db"
import { careTasks, files } from "@/db/schema"
import { eq } from "drizzle-orm"
export const PUT = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params
  const parmas = careTaskSchema.safeParse(await request.json())
  if (!parmas.success) {
    throw new Error(parmas.error.errors[0].message)
  }
  const [careTask] = await db.update(careTasks).set({
    ...parmas.data,
  }).where(eq(careTasks.id, parseInt(id))).returning()
  if (!careTask) {
    throw new Error('Care task not found')
  }
  // 使用事务确保数据一致性
  await db.transaction(async (tx) => {
    // 更新封面文件描述
    if (careTask.coverId) {
      await tx.update(files).set({
        sourceName: `${careTask.name}护理任务封面`
      }).where(eq(files.id, careTask.coverId))
    }

    // 更新音频文件描述
    if (careTask.audioId) {
      await tx.update(files).set({
        sourceName: `${careTask.name}护理任务音频`
      }).where(eq(files.id, careTask.audioId))
    }
  })
  return 'ok'
}, {
  requireAuth: true,
  hasParams: true,
  permission: 'caretask:write'
})
export const DELETE = createHandler(async (request: NextRequest, params: { id: string }) => {
  const { id } = params
  const [careTask] = await db.update(careTasks).set({
    deleted: true
  }).where(eq(careTasks.id, parseInt(id))).returning()
  if (!careTask) {
    throw new Error('Care task not found')
  }
  return 'ok'
}, {
  requireAuth: true,
  hasParams: true,
  permission: 'caretask:write'
})
import { NextRequest } from "next/server"
import { createHandler } from "../../../_utils/handler"
import { careTaskSchema } from "@/lib/validations"
import { db } from "@/db"
import { careTasks } from "@/db/schema"
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
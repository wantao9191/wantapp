import { NextRequest } from "next/server"
import { createHandler } from "../../../_utils/handler"
import { db } from "@/db"
import { careTasks } from "@/db/schema"
import { eq, and } from "drizzle-orm"
export const GET = createHandler(async (request: NextRequest, params, context) => {
  const careTaskList = await db.select({
    label: careTasks.name,
    value: careTasks.id
  })
    .from(careTasks)
    .where(and(eq(careTasks.deleted, false), eq(careTasks.status, 1)))
    .orderBy(careTasks.createTime)
  return { contents: careTaskList }
}, {
  permission: 'caretask:read',
  requireAuth: true,
  hasParams: true
})  
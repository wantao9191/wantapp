import { createHandler } from "../../../../_utils/handler"
import { NextRequest } from "next/server"
import { db } from "@/db"
import { carePackages, careTasks } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"

export const GET = createHandler(async (request: NextRequest, params: { id: string }) => {
  const { id } = params
  const [carePackage] = await db.select().from(carePackages).where(eq(carePackages.id, parseInt(id)))
  if (!carePackage) {
    throw '护理套餐不存在'
  }
  const tasks = await db.select().from(careTasks).where(inArray(careTasks.id, carePackage.tasks || []))
  return tasks.map((task) => ({
    id: task.id,
    name: task.name
  }))
}, {
  requireAuth: true,
  hasParams: true,
  permission: 'caretask:read'
})
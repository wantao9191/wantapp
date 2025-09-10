import { NextRequest } from "next/server"
import { createHandler } from "../../../_utils/handler"
import { permissionSchema } from "@/lib/validations"
import { db } from "@/db"
import { permissions } from "@/db/schema"
import { eq } from "drizzle-orm"

export const PUT = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params
  const parmas = permissionSchema.safeParse(await request.json())
  if (!parmas.success) {
    throw new Error(parmas.error.errors[0].message)
  }
  const [permission] = await db.update(permissions).set({
    ...parmas.data,
  }).where(eq(permissions.id, parseInt(id))).returning()
  if (!permission) {
    throw new Error('权限不存在')
  }
  return 'ok'
}, {
  permission: 'permission:write',
  requireAuth: true,
  hasParams: true
})
export const DELETE = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params
  const [permission] = await db.update(permissions).set({
    deleted: true
  }).where(eq(permissions.id, parseInt(id))).returning()
  if (!permission) {
    throw new Error('权限不存在')
  }
  return 'ok'
}, {
  permission: 'permission:write',
  requireAuth: true,
  hasParams: true
})

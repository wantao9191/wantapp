import { NextRequest } from "next/server"
import { createHandler } from "../../../_utils/handler"
import { roleSchema } from "@/lib/validations"
import { db } from "@/db"
import { roles } from "@/db/schema"
import { eq } from "drizzle-orm"

export const PUT = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params
  const parmas = roleSchema.safeParse(await request.json())
  if (!parmas.success) {
    throw new Error(parmas.error.errors[0].message)
  }
  const [role] = await db.update(roles).set({
    ...parmas.data,
  }).where(eq(roles.id, parseInt(id))).returning()
  if (!role) {
    throw new Error('角色不存在')
  }
  return 'ok'
}, {
  permission: 'role:write',
  requireAuth: true,
  hasParams: true
})

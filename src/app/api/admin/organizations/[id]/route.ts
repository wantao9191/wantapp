import { NextRequest } from "next/server"
import { createHandler } from "../../../_utils/handler"
import { organizationSchema } from "@/lib/validations"
import { db } from "@/db"
import { organizations } from "@/db/schema"
import { eq } from "drizzle-orm"

export const PUT = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params
  const parmas = organizationSchema.safeParse(await request.json())
  if (!parmas.success) {
    throw new Error(parmas.error.errors[0].message)
  }
  const [org] = await db.update(organizations).set({
    ...parmas.data,
    setupTime: parmas.data.setupTime ? new Date(parmas.data.setupTime) : undefined
  }).where(eq(organizations.id, parseInt(id))).returning()
  if (!org) {
    throw new Error('机构不存在')
  }
  return 'ok'
}, {
  permission: 'organization:write',
  requireAuth: true,
  hasParams: true
})
export const DELETE = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params
  const [org] = await db.update(organizations)
    .set({
      deleted: true
    })
    .where(eq(organizations.id, parseInt(id)))
    .returning()
  if (!org) {
    throw new Error('机构不存在')
  }
  return 'ok'
}, {
  permission: 'organization:write',
  requireAuth: true,
  hasParams: true
})
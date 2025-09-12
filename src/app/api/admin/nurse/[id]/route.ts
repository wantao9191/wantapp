import { NextRequest } from "next/server"
import { createHandler } from "../../../_utils/handler"
import { db } from "@/db"
import { personInfo } from "@/db/schema"
import { eq } from "drizzle-orm"
import { personInfoSchema } from "@/lib/validations"
import { getAgeFromIdCard, getGenderFromIdCard, getBirthDateFromIdCard } from "@/lib/utils"
const DEFAULT_TYPE = 'nurse'
export const PUT = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params
  const data = await request.json()
  data.type = DEFAULT_TYPE

  // 先查询现有护士信息
  const [currentNurse] = await db.select().from(personInfo).where(eq(personInfo.id, parseInt(id))).limit(1)
  if (!currentNurse) {
    throw new Error('护理员不存在')
  }

  // 权限校验：非超级管理员只能操作自己机构的护理员
  if (!context?.isSuperAdmin) {
    if (currentNurse.organizationId !== Number(context?.organizationId)) {
      throw new Error('无权限操作该护理员')
    }
  }

  if (context?.isSuperAdmin) {
    if (!data.organizationId) {
      throw new Error('机构ID不能为空')
    }
  } else {
    data.organizationId = Number(context?.organizationId)
  }
  const insuredParams = personInfoSchema.safeParse(data)
  if (!insuredParams.success) {
    throw new Error(insuredParams.error.errors[0].message)
  }
  // 从身份证号提取信息
  const { credential } = insuredParams.data
  const age = getAgeFromIdCard(credential)
  const gender = getGenderFromIdCard(credential)
  const birthDate = getBirthDateFromIdCard(credential)

  // 构建插入数据
  const insertData = {
    ...insuredParams.data,
    gender: gender || '',
    age: age || 0,
    birthDate: birthDate || null,
  }
  await db.update(personInfo).set(insertData).where(eq(personInfo.id, parseInt(id))).returning()

  return 'ok'
}, {
  permission: 'nurse:write',
  requireAuth: true,
  hasParams: true
})

export const DELETE = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params

  // 先查询现有护士信息
  const [currentNurse] = await db.select().from(personInfo).where(eq(personInfo.id, parseInt(id))).limit(1)
  if (!currentNurse) {
    throw new Error('护理员不存在')
  }

  // 权限校验：非超级管理员只能操作自己机构的护理员
  if (!context?.isSuperAdmin) {
    if (currentNurse.organizationId !== Number(context?.organizationId)) {
      throw new Error('无权限操作该护理员')
    }
  }

  await db.update(personInfo).set({ deleted: true }).where(eq(personInfo.id, parseInt(id))).returning()

  return 'ok'
}, {
  permission: 'nurse:write',
  requireAuth: true,
  hasParams: true
})
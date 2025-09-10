import { NextRequest } from "next/server"
import { createHandler } from "../../../_utils/handler"
import { db } from "@/db"
import { personInfo } from "@/db/schema"
import { eq } from "drizzle-orm"
import { insuredSchema } from "@/lib/validations"
import { getAgeFromIdCard, getGenderFromIdCard, getBirthDateFromIdCard } from "@/lib/utils"
const DEFAULT_TYPE = 'insured'
export const PUT = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params
  const data = await request.json()
  data.type = DEFAULT_TYPE
  if (context?.isSuperAdmin) {
    if (!data.organizationId) {
      throw new Error('机构ID不能为空')
    }
  } else {
    data.organizationId = Number(context?.organizationId)
  }
  const insuredParams = insuredSchema.safeParse(data)
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
  const [insured] = await db.update(personInfo).set(insertData).where(eq(personInfo.id, parseInt(id))).returning()
  if (!insured) {
    throw new Error('参保人不存在')
  }
  return 'ok'
}, {
  permission: 'insured:write',
  requireAuth: true,
  hasParams: true
})

export const DELETE = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params
  const [insured] = await db.update(personInfo).set({ deleted: true }).where(eq(personInfo.id, parseInt(id))).returning()
  if (!insured) {
    throw new Error('参保人不存在')
  }
  return 'ok'
}, {
  permission: 'insured:write',
  requireAuth: true,
  hasParams: true
})
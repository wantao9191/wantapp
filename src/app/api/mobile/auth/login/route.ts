import { createHandler } from '@/app/api/_utils/handler'
import { NextRequest } from 'next/server'
import { mobileLoginSchema } from '@/lib/validations'
import { db } from '@/db'
import { personInfo, organizations } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword } from '@/lib/password'
import { generateRandomString } from '@/lib/utils'
import { getUserPermissions, isSuperAdmin } from '@/lib/permissions'
import { signAccessToken, AccessTokenPayload, signRefreshToken } from '@/lib/jwt'
export const POST = createHandler(async (request: NextRequest) => {
  const params = mobileLoginSchema.safeParse(await request.json())
  if (!params.success) {
    throw new Error(params.error.errors[0].message)
  }
  const { username, password } = params.data
  const user = await db.select({
    id: personInfo.id, 
    username: personInfo.username,
    password: personInfo.password,
    status: personInfo.status,
    name: personInfo.name,
    mobile: personInfo.mobile,
    createTime: personInfo.createTime,
    type: personInfo.type,
    description: personInfo.description,
    deleted: personInfo.deleted,
    organizationId: personInfo.organizationId,
    organizationName: organizations.name,
  }).from(personInfo).leftJoin(organizations, eq(personInfo.organizationId, organizations.id)).where(eq(personInfo.username, username)).limit(1)
  const currentUser = user[0]
  if (!currentUser) {
    throw new Error('用户不存在')
  }

  // 检查用户状态
  if (currentUser.deleted) {
    throw new Error('用户已被删除，请联系管理员')
  }
  if (currentUser.status === 0) {
    throw new Error('用户已被禁用，请联系管理员')
  }
  const { password: userPassword, deleted: _, description: __, status: ___, ...userInfo } = currentUser

  if (!(await verifyPassword(password, currentUser.password))) {
    throw new Error('密码错误')
  }

  // 生成会话ID
  const sessionId = generateRandomString(32)

  // 获取用户完整权限信息
  const [userPermissions, isAdmin] = await Promise.all([
    getUserPermissions(userInfo.id),
    isSuperAdmin(userInfo.id)
  ])

  // 构建JWT payload，包含完整权限信息
  const accessTokenPayload: AccessTokenPayload = {
    id: userInfo.id,
    permissions: userPermissions,
    organizationId: userInfo.organizationId,
    isSuperAdmin: isAdmin,
    source: 'mobile',  // 明确标识为移动端token
    userType: currentUser.type as 'nurse' | 'insured' | 'family'  // 移动端用户类型
  }

  // 生成访问令牌和刷新令牌
  const accessToken = await signAccessToken(accessTokenPayload, 2592000)
  const refreshToken = await signRefreshToken({
    sub: userInfo.id.toString(),
    sid: sessionId
  })
  return {
    accessToken,
    refreshToken,
    userInfo
  }
}, {
  requireAuth: false,
  source: 'mobile'
})
import { NextRequest } from 'next/server'
import { createHandler } from '../../../_utils/handler'
import { cookies } from 'next/headers'
import { decryptJson } from '@/lib/crypto'
import { loginSchema } from '@/lib/validations'
import { db } from '@/db'
import { users, organizations } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { User } from '@/types'
import { verifyPassword } from '@/lib/password'
import { signAccessToken, signRefreshToken, AccessTokenPayload } from '@/lib/jwt'
import { generateRandomString } from '@/lib/utils'
import { getUserPermissions, isSuperAdmin } from '@/lib/permissions'
export const POST = createHandler(async (request: NextRequest) => {
  const params = loginSchema.safeParse(await request.json())
  if (!params.success) {
    throw new Error(params.error.errors[0].message)
  }
  const { username, password, code } = params.data
  const cookieStore = await cookies()
  const captcha = cookieStore.get('captcha')
  cookieStore.delete('captcha')
  if (!captcha) {
    throw new Error('验证码已过期')
  }
  const captchaData = await decryptJson(captcha.value)

  // 检查验证码是否过期
  const now = Date.now()
  if (now > captchaData.expires) {
    throw new Error('验证码已过期')
  }

  if (captchaData.code !== code) {
    throw new Error('验证码错误')
  }
  const user: User[] = await db.select({
    id: users.id,
    username: users.username,
    password: users.password,
    status: users.status,
    name: users.name,
    phone: users.phone,
    createTime: users.createTime,
    roles: users.roles,
    email: users.email,
    description: users.description,
    deleted: users.deleted,
    organizationId: users.organizationId,
    organizationName: organizations.name,
  }).from(users).leftJoin(organizations, eq(users.organizationId, organizations.id)).where(eq(users.username, username)).limit(1)
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
  if (!(await verifyPassword(password, userPassword))) {
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
    roles: userInfo.roles || [],
    permissions: userPermissions,
    organizationId: userInfo.organizationId,
    isSuperAdmin: isAdmin
  }

  // 生成访问令牌和刷新令牌
  const accessToken = await signAccessToken(accessTokenPayload)
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
  requireAuth: false
})
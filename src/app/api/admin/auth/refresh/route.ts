import { NextRequest } from 'next/server'
import { createHandler } from '../../../_utils/handler'
import { verifyRefreshToken, signAccessToken, signRefreshToken, AccessTokenPayload } from '@/lib/jwt'
import { generateRandomString } from '@/lib/utils'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getUserPermissions,isSuperAdmin } from '@/lib/permissions'

export const POST = createHandler(async (request: NextRequest) => {
  const { refreshToken } = await request.json()

  if (!refreshToken) {
    throw new Error('刷新令牌不能为空')
  }

  try {
    // 验证刷新令牌
    const payload = await verifyRefreshToken(refreshToken)

    // 根据用户ID获取最新用户信息
    const user: any[] = await db.select().from(users).where(eq(users.id, parseInt(payload.sub))).limit(1)
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

    const { password, ...userInfo } = currentUser

    // 生成新的会话ID（令牌轮换）
    const newSessionId = generateRandomString(32)
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
    // 生成新的访问令牌和刷新令牌
    const newAccessToken = await signAccessToken(accessTokenPayload)
    const newRefreshToken = await signRefreshToken({
      sub: userInfo.id.toString(),
      sid: newSessionId
    })

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      userInfo
    }
  } catch (error: any) {
    // 如果是我们明确抛出的业务错误，直接重新抛出
    if (error.message === '用户不存在' ||
      error.message === '用户已被删除，请联系管理员' ||
      error.message === '用户已被禁用，请联系管理员') {
      throw error
    }
    // 其他错误（如JWT验证失败）统一处理
    throw new Error('刷新令牌无效或已过期')
  }
}, {
  requireAuth: false
})

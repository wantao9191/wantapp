import { NextRequest } from 'next/server'
import { createHandler } from '../../../_utils/handler'
import { verifyRefreshToken } from '@/lib/jwt'
import { badRequest } from '../../../_utils/response'

// 简单的内存黑名单（生产环境建议使用Redis）
const tokenBlacklist = new Set<string>()

export const POST = createHandler(async (request: NextRequest) => {
  let body: any
  
  try {
    body = await request.json()
  } catch (error) {
    return badRequest('Invalid JSON format')
  }
  
  const { refreshToken } = body
  
  if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim() === '') {
    return badRequest('刷新令牌不能为空')
  }

  try {
    // 验证刷新令牌
    const payload = await verifyRefreshToken(refreshToken)
    
    // 将令牌加入黑名单
    tokenBlacklist.add(refreshToken)
    
    return { message: '令牌已撤销' }
  } catch (error: any) {
    return badRequest('刷新令牌无效')
  }
}, {
  requireAuth: false
})

// 检查令牌是否在黑名单中
export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token)
}

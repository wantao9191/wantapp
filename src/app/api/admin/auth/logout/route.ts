import { NextRequest } from 'next/server'
import { createHandler } from '../../../_utils/handler'
import { cookies } from 'next/headers'

export const POST = createHandler(async (request: NextRequest) => {
  const cookieStore = await cookies()
  
  // 删除所有认证相关的 cookies
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  cookieStore.delete('captcha') // 删除验证码 cookie
  
  return { 
    message: '退出登录成功' 
  }
}, {
  requireAuth: false // 不需要认证，因为用户可能已经过期但仍需要退出
})
'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Loading from '@/components/ui/Loading'
import Cookies from 'js-cookie'
interface AuthGuardProps {
  children: React.ReactNode
}

// 内部组件处理 useSearchParams
const AuthGuardInner: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [checking, setChecking] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
  // 公开路由：登录页直接放行
  const isLoginPage = pathname === '/admin/login'
  useEffect(() => {
    // 仅在浏览器端执行
    if (typeof window === 'undefined') return
    
    const checkAuth = async () => {
      const token = Cookies.get('access_token')
      
      // 登录页不做校验
      if (isLoginPage) {
        if (token) {
          // 使用push而不是replace，避免页面刷新
          router.push('/admin/index')
        }
        setChecking(false)
        return
      }
      
      // 读取前端可访问的 token（本地缓存或非 HttpOnly Cookie）
      if (!token || token === 'undefined') {
        const search = window.location.search || ''
        const redirect = encodeURIComponent(pathname + search)
        // 使用push而不是replace，避免页面刷新
        router.push(`/admin/login?redirect=${redirect}`)
        return
      }
      
      setChecking(false)
    }
    
    checkAuth()
  }, [isLoginPage, pathname, router, searchParams])
  if (checking || isRedirecting) {
    return <Loading />
  }
  return <>{children}</>
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  return (
    <Suspense fallback={<Loading />}>
      <AuthGuardInner>{children}</AuthGuardInner>
    </Suspense>
  )
}

export default AuthGuard



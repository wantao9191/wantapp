import { useEffect, useState } from "react"
import { http } from "@/lib/https"
import Cookies from 'js-cookie'
import { useRouter } from "next/navigation"
export const useAuth = () => {
  const [checked, setChecked] = useState(false)
  const [captcha, setCaptcha] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isLogin, setIsLogin] = useState(false)
  const router = useRouter()
  const getCaptcha = async () => {
    try {
      const res = await http.get('/captcha')
      const data = res.data
      const url = URL.createObjectURL(data)
      setCaptcha(url)
    } catch (error: any) {
      console.log(error)
    }
  }
  const login = async (username: string, password: string, code: string) => {
    try {
      const res = await http.post('/admin/auth/login', { username, password, code })
      // 存储访问令牌和刷新令牌
      Cookies.set('access_token', res.data.accessToken)
      Cookies.set('refresh_token', res.data.refreshToken, { httpOnly: false, secure: true })
      localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
      setUserInfo(res.data.userInfo)
      setIsLogin(true)
      if (checked) {
        localStorage.setItem('login_info', JSON.stringify({ username, password }))
      }
      router.replace('/admin/index')
    } catch (error: any) {
      throw error
    }
  }
  // 刷新令牌
  const refreshTokens = async () => {
    try {
      const refreshToken = Cookies.get('refresh_token')
      if (!refreshToken) {
        throw new Error('没有刷新令牌')
      }
      
      const res = await http.post('/admin/auth/refresh', { refreshToken })
      Cookies.set('access_token', res.data.accessToken)
      Cookies.set('refresh_token', res.data.refreshToken, { httpOnly: false, secure: true })
      localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
      setUserInfo(res.data.userInfo)
      return res.data.accessToken
    } catch (error: any) {
      // 刷新失败，清除所有令牌
      logout()
      throw error
    }
  }

  const logout = async () => {
    // 直接清除本地存储，不需要调用服务端接口
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    localStorage.removeItem('userInfo')
    sessionStorage.clear()
    setUserInfo(null)
    setIsLogin(false)
    router.replace('/admin/login')
  }
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo && userInfo !== 'undefined') {
      setUserInfo(JSON.parse(userInfo))
      setIsLogin(true)
    }
  }, [])
  return { checked, setChecked, captcha, getCaptcha, login, logout, refreshTokens, userInfo, isLogin }
}
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
      const res = await http.post('/admin/login', { username, password, code })
      Cookies.set('access_token', res.data.token)
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
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo && userInfo !== 'undefined') {
      setUserInfo(JSON.parse(userInfo))
      setIsLogin(true)
    }
  }, [])
  return { checked, setChecked, captcha, getCaptcha, login, userInfo, isLogin }
}
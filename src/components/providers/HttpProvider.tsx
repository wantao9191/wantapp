'use client'

import { useEffect } from 'react'
import { App } from 'antd'
import { http } from '@/lib/http'

export function HttpProvider({ children }: { children: React.ReactNode }) {
  const { message } = App.useApp()

  useEffect(() => {
    // 设置 HTTP 客户端的 message API
    http.setMessageApi(message)
  }, [message])

  return <>{children}</>
}

/// <reference types="next" />
/// <reference types="next/image-types/global" />

// 环境变量类型定义
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    DATABASE_URL: string
    NEXTAUTH_SECRET: string
    NEXTAUTH_URL: string
    API_SECRET_KEY?: string
    CUSTOM_KEY?: string
    PORT?: string
      JWT_SECRET?: string
      JWT_REFRESH_SECRET?: string
      JWT_ISSUER?: string
      JWT_AUDIENCE?: string
      ACCESS_TOKEN_TTL?: string
      REFRESH_TOKEN_TTL?: string
      DATA_ENCRYPTION_KEY?: string
  }
}

// UnoCSS 类型支持
declare module 'uno.css'

// 全局类型扩展
declare global {
  interface Window {
    // 如果需要在 window 对象上添加属性
    gtag?: (...args: any[]) => void
  }
}

export {}

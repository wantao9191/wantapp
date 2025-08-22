import { db } from "@/db"
import { apiPermissions } from "@/db/schema"
import { eq } from "drizzle-orm"

interface ApiPermissionConfig {
  path: string
  method?: string
  permission: string
}

// 权限配置缓存
let configCache: Record<string, string> | null = null
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存
/**
 * 从数据库获取API权限配置
 */
export async function getApiPermissionConfig(): Promise<Record<string, string>> {
  try {
    const configs = await db
      .select({
        path: apiPermissions.path,
        method: apiPermissions.method,
        permission: apiPermissions.permission
      })
      .from(apiPermissions)
      .where(eq(apiPermissions.status, 1))
    
    // 构建路径-权限映射
    const pathPermissionMap: Record<string, string> = {}
    
    configs.forEach(config => {
      // 如果指定了HTTP方法，使用 "METHOD:PATH" 作为key
      const key = config.method ? `${config.method}:${config.path}` : config.path
      pathPermissionMap[key] = config.permission
    })
    
    return pathPermissionMap
  } catch (error) {
    console.error('Failed to load API permission config:', error)
    return {}
  }
}

/**
 * 获取指定路径所需的权限
 */
export async function getRequiredPermission(pathname: string, method?: string): Promise<string | null> {
  const now = Date.now()
  
  // 检查缓存是否有效
  if (!configCache || (now - cacheTime) > CACHE_DURATION) {
    configCache = await getApiPermissionConfig()
    cacheTime = now
  }
  
  // 1. 尝试精确匹配（包含HTTP方法）
  if (method) {
    const keyWithMethod = `${method}:${pathname}`
    if (configCache[keyWithMethod]) {
      return configCache[keyWithMethod]
    }
  }
  
  // 2. 尝试路径匹配（不包含HTTP方法）
  if (configCache[pathname]) {
    return configCache[pathname]
  }
  
  // 3. 动态路由匹配
  for (const [pattern, permission] of Object.entries(configCache)) {
    const cleanPattern = pattern.includes(':') ? pattern.split(':')[1] : pattern
    if (matchDynamicRoute(pathname, cleanPattern)) {
      return permission
    }
  }
  
  return null
}

/**
 * 匹配动态路由
 */
function matchDynamicRoute(pathname: string, pattern: string): boolean {
  const pathSegments = pathname.split('/')
  const patternSegments = pattern.split('/')
  
  if (pathSegments.length !== patternSegments.length) {
    return false
  }
  
  return patternSegments.every((segment, index) => {
    // [id] 或 [slug] 等动态参数
    if (segment.startsWith('[') && segment.endsWith(']')) {
      return true
    }
    return segment === pathSegments[index]
  })
}

/**
 * 清除权限配置缓存
 */
export function clearPermissionConfigCache(): void {
  configCache = null
  cacheTime = 0
}
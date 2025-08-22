import { type ClassValue, clsx } from 'clsx'

/**
 * 合并 CSS 类名的工具函数
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('default', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 生成随机 ID
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 截断文本
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * 生成 slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}
/**
 * 移除对象中的undefined/null
 */
export function removeUndefined(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null))
}
/**
 * 根据 parentCode 关联数组，构建树形结构
 * @param menuData 菜单数据数组
 */
export function buildMenuTree(menuData: any[]) {
  // 创建菜单映射表
  const menuMap = new Map<string, any>()
  const rootMenus: any[] = []

  // 第一步：创建所有菜单的映射，并初始化 children 数组
  menuData.forEach(menu => {
    menuMap.set(menu.code, {
      ...menu,
      children: []
    })
  })

  // 第二步：构建父子关系
  menuData.forEach(menu => {
    if (menu.parentCode) {
      // 子菜单：找到父菜单，添加到其 children 中
      const parent = menuMap.get(menu.parentCode)
      if (parent) {
        parent.children.push(menuMap.get(menu.code))
      } else {
        console.warn(`⚠️ 未找到父菜单: ${menu.parentCode}，菜单: ${menu.name}`)
      }
    } else {
      // 根菜单：没有 parentCode 的菜单
      rootMenus.push(menuMap.get(menu.code))
    }
  })

  return rootMenus
}
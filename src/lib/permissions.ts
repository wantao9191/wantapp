import { db } from '@/db'
import { users, roles } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'

/**
 * 根据用户ID获取用户的所有权限
 */
export async function getUserPermissions(userId: number): Promise<any[]> {
  // 1. 获取用户信息和角色ID
  const user = await db.select({
    roles: users.roles,
  }).from(users).where(eq(users.id, userId)).limit(1)
  if (!user[0] || !user[0].roles || user[0].roles.length === 0) {
    return []
  }
  // 2. 获取角色信息和权限
  const userRoles = await db.select({
    permissions: roles.permissions,
    name: roles.name,
    code: roles.code,
  }).from(roles).where(inArray(roles.id, user[0].roles))
  // 3. 检查是否为超级管理员
  const isSuperAdmin = userRoles.some(role => role.code === 'system_admin')
  if (isSuperAdmin) {
    return ['*']
  }
  // 4. 合并所有角色的权限
  const allPermissions = userRoles
    .flatMap(role => role.permissions || [])
    .filter((permission, index, arr) => arr.indexOf(permission) === index) // 去重

  return allPermissions
}

/**
 * 检查用户是否有特定权限
 */
export async function hasPermission(userId: number, permission: string): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)
  
  // 超级管理员有所有权限
  if (userPermissions.includes('*')) {
    return true
  }
  
  return userPermissions.includes(permission)
}
/**
 * 检查用户是否为超级管理员
 */
export async function isSuperAdmin(userId: number): Promise<boolean> {
  const user = await db
    .select({ roles: users.roles })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user[0]?.roles) return false

  const userRoles = await db
    .select({ isSuperAdmin: roles.name })
    .from(roles)
    .where(inArray(roles.id, user[0].roles))

  return userRoles.some(role => role.isSuperAdmin === 'system_admin')
}

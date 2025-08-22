import * as schema from '@/db/schema';

// 导出所有表的类型
export type Organization = typeof schema.organizations.$inferSelect;
export type User = typeof schema.users.$inferSelect;
export type Role = typeof schema.roles.$inferSelect;
export type Permission = typeof schema.permissions.$inferSelect;
export type Menu = typeof schema.menus.$inferSelect;
export type ApiPermission = typeof schema.apiPermissions.$inferSelect;
export type Dict = typeof schema.dicts.$inferSelect;
// export type Department = typeof schema.departments.$inferSelect;
// export type UserRole = typeof schema.userRoles.$inferSelect;
// export type RolePermission = typeof schema.rolePermissions.$inferSelect;
// export type RoleMenu = typeof schema.roleMenus.$inferSelect;
// export type OperationLog = typeof schema.operationLogs.$inferSelect;
// export type LoginLog = typeof schema.loginLogs.$inferSelect;
// export type SystemConfig = typeof schema.systemConfigs.$inferSelect;

// 插入类型
export type NewOrganization = typeof schema.organizations.$inferInsert;
export type NewUser = typeof schema.users.$inferInsert;
export type NewRole = typeof schema.roles.$inferInsert;
export type NewPermission = typeof schema.permissions.$inferInsert;
export type NewMenu = typeof schema.menus.$inferInsert;
export type NewApiPermission = typeof schema.apiPermissions.$inferInsert;
export type NewDict = typeof schema.dicts.$inferInsert;
// export type NewDepartment = typeof schema.departments.$inferInsert;

// 状态枚举
export enum Status {
  DISABLED = 0,
  ENABLED = 1,
}

// 登录状态枚举
export enum LoginStatus {
  FAILED = 0,
  SUCCESS = 1,
}

// 用户类型枚举
export enum UserType {
  SUPER_ADMIN = 'system_admin',
  ORG_ADMIN = 'org_admin',
  ORG_NURSE = 'org_nurse',
  ORG_INSURED = 'org_insured',
  ORG_FAMILY = 'org_family',
}

// 角色类型枚举
export enum RoleType {
  SYSTEM_ADMIN = 'system_admin',
  ORG_ADMIN = 'org_admin',
  ORG_NURSE = 'org_nurse',
  ORG_INSURED = 'org_insured',
  ORG_FAMILY = 'org_family',
}

// 权限类型枚举
export enum PermissionType {
  SYSTEM = 'system',
  ORG = 'org',
}

// 菜单类型枚举
export enum MenuType {
  SYSTEM = 'system',
  ORG = 'org',
}

// 配置类型枚举
export enum ConfigType {
  SYSTEM = 'system',
  ORG = 'org',
}
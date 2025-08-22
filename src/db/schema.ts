import { pgTable, varchar, timestamp, integer, text, json, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

//  机构表
export const organizations = pgTable('organizations', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 100 }).notNull(),
  address: varchar('address', { length: 255 }),
  phone: varchar('phone', { length: 11 }),
  email: varchar('email', { length: 50 }),
  operator: varchar('operator', { length: 50 }),
  setupTime: timestamp('setup_time'),
  code: varchar('code', { length: 50 }).unique().notNull(),
  description: text('description'),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  deleted: boolean('deleted').default(false),
});
//  角色表
export const roles = pgTable('roles', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 50 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  menus: json('menus').$type<number[]>().default([]),
  permissions: json('permissions').$type<number[]>().default([]),
  description: text('description'),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  deleted: boolean('deleted').default(false),
})
//  用户表
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  username: varchar('username', { length: 50 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 11 }).notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  roles: json('roles').$type<number[]>(),
  organizationId: integer('organization_id').references(() => organizations.id), // 修改这里
  deleted: boolean('deleted').default(false),
})
//  权限表
export const permissions = pgTable('permissions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 50 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  description: text('description'),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  roles: json('roles').$type<number[]>(),
  deleted: boolean('deleted').default(false),
})
//  菜单表
export const menus = pgTable('menus', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 50 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  description: text('description'),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  deleted: boolean('deleted').default(false),
})
// API权限表
export const apiPermissions = pgTable('api_permissions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  path: varchar('path', { length: 200 }).notNull(), // API路径
  method: varchar('method', { length: 10 }), // GET, POST, PUT, DELETE
  permission: varchar('permission', { length: 100 }).notNull(), // 所需权限
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  deleted: boolean('deleted').default(false),
})
// 字典表
export const dicts = pgTable('dicts', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  code: varchar('code', { length: 50 }).notNull(),
  label: varchar('label', { length: 50 }).notNull(),
  value: varchar('value', { length: 50 }).notNull(),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  deleted: boolean('deleted').default(false),
})

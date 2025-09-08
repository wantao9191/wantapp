import { pgTable, varchar, timestamp, integer, text, boolean } from 'drizzle-orm/pg-core';
import { files } from './files';
import { organizations } from './systems';

// 人员信息表
export const personInfo = pgTable('person_info', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 50 }).notNull(),
  username: varchar('username', { length: 50 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  mobile: varchar('mobile', { length: 11 }).notNull(),
  gender: varchar('gender', { length: 10 }).notNull(),
  age: integer('age').notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  credential: varchar('credential', { length: 50 }).notNull(),
  avatar: integer('avatar').references(() => files.id),
  organizationId: integer('organization_id').references(() => organizations.id),
  type: varchar('type', { length: 50 }).notNull(), // nurse: 护理员, insured: 参保人, family: 家属
  description: text('description'),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  deleted: boolean('deleted').default(false),
});
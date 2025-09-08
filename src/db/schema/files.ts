import { pgTable, varchar, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { users } from './systems';

// 文件表
export const files = pgTable('files', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 50 }).notNull(),
  sourceName: varchar('source_name', { length: 50 }),
  path: varchar('path', { length: 255 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  deleted: boolean('deleted').default(false),
  createBy: integer('create_by').references(() => users.id),
});

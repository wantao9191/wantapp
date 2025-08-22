import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
dotenv.config({
  path: '.env.local'
});
// 检查环境变量
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL 环境变量未设置')
}

// 创建 PostgreSQL 连接
const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString, {
  max: process.env.NODE_ENV === 'production' ? 10 : 5,
  idle_timeout: 20,
  connect_timeout: 10,
})

// 创建 Drizzle 数据库实例
export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === 'development',
})

// 导出类型
export type Database = typeof db
export * from './schema'

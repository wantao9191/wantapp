import { defineConfig } from 'drizzle-kit'

// 尝试加载 dotenv（如果可用）
try {
  const dotenv = require('dotenv');
  const envFile = process.env.NODE_ENV === 'production' 
    ? '.env.production.local' 
    : '.env.local';
  dotenv.config({ path: envFile });
} catch (error) {
  // dotenv 不可用，使用系统环境变量
  console.log('dotenv 不可用，使用系统环境变量');
}
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  // 开发环境配置
  ...(process.env.NODE_ENV === 'development' && {
    introspect: {
      casing: 'camel',
    },
  }),
})

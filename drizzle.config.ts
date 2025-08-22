import { defineConfig } from 'drizzle-kit'
import dotenv from 'dotenv';
dotenv.config({
  path: '.env.local'
});
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

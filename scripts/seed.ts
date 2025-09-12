// 修改 src/scripts/seed.ts
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

import { seedDatabase } from '@/db/seed';
console.log(process.env);

async function main() {
 
  try {
    console.log('开始执行数据库种子脚本...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL); // 添加这行
    console.log('NODE_ENV:', process.env.NODE_ENV); // 添加这行
    await seedDatabase();
    console.log('数据库种子脚本执行完成！');
    process.exit(0);
  } catch (error) {
    console.error('数据库种子脚本执行失败:', error);
    process.exit(1);
  }
}

main();
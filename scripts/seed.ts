// 修改 src/scripts/seed.ts
import dotenv from 'dotenv';
import { seedDatabase } from '@/db/seed';
dotenv.config({
  path: '.env.local'
});
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
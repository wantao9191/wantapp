import postgres from 'postgres';

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

async function createDatabase() {
  try {
    console.log('=== 创建数据库 ===',process.env);
    
    // 连接到默认的postgres数据库
    const connectionString = process.env.DATABASE_URL!
    console.log('连接字符串:', connectionString);
    
    const client = postgres(connectionString, {
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connect_timeout: 30, // 增加连接超时时间
    });
    
    try {
      console.log('连接到默认数据库...');
      
      // 检查数据库是否已存在
      const exists = await client`
        SELECT 1 FROM pg_database WHERE datname = 'wantapp'
      `;
      
      if (exists.length > 0) {
        console.log('✅ 数据库 wantapp 已存在');
      } else {
        console.log('创建数据库 wantapp...');
        await client`CREATE DATABASE wantapp`;
        console.log('✅ 数据库创建成功');
      }
      
    } finally {
      await client.end();
    }
    
  } catch (error) {
    console.error('创建数据库失败:', error);
  } finally {
    process.exit(0);
  }
}

createDatabase(); 
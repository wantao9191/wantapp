#!/bin/bash

echo "🚀 Starting deployment..."

# 设置错误时退出
set -e

# 停止应用
echo "⏹️  Stopping application..."
pm2 stop wantweb || echo "Application not running"

# 清理旧的构建文件和缓存
echo "🧹 Cleaning old build files and cache..."
rm -rf .next
rm -rf .next-memory
rm -rf node_modules/.cache
pnpm store prune || echo "Store prune skipped"

# 构建应用
echo "🔨 Building application..."
pnpm build:prod

# 检查构建是否成功
if [ ! -d ".next/standalone" ]; then
    echo "❌ Build failed - standalone directory not found"
    exit 1
fi

# 复制静态文件到 standalone 目录
echo "📁 Copying static files..."
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# 确保静态文件权限正确
chmod -R 755 .next/standalone/.next/static
chmod -R 755 .next/standalone/public

# 启动应用
echo "▶️  Starting application..."
pm2 start ecosystem.config.js

# 等待应用启动
sleep 3

# 显示状态
echo "📊 Application status:"
pm2 status

# 检查应用是否正常运行
if pm2 list | grep -q "wantweb.*online"; then
    echo "✅ Deployment completed successfully!"
else
    echo "❌ Deployment failed - application not running"
    pm2 logs wantweb --lines 20
    exit 1
fi
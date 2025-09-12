#!/bin/bash

# 服务器环境检查脚本
echo "🔍 检查服务器环境..."

# 检查 Node.js
echo "📦 检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
    
    # 检查版本是否 >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo "✅ Node.js 版本符合要求 (>= 18)"
    else
        echo "❌ Node.js 版本过低，需要 >= 18"
    fi
else
    echo "❌ Node.js 未安装"
fi

# 检查 pnpm
echo "📦 检查 pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo "✅ pnpm: $PNPM_VERSION"
else
    echo "❌ pnpm 未安装"
fi

# 检查 PM2
echo "📦 检查 PM2..."
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    echo "✅ PM2: $PM2_VERSION"
else
    echo "❌ PM2 未安装"
fi

# 检查 Docker
echo "📦 检查 Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker: $DOCKER_VERSION"
else
    echo "❌ Docker 未安装"
fi

# 检查 Docker Compose
echo "📦 检查 Docker Compose..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo "✅ Docker Compose: $COMPOSE_VERSION"
else
    echo "❌ Docker Compose 未安装"
fi

# 检查 Nginx
echo "📦 检查 Nginx..."
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1)
    echo "✅ Nginx: $NGINX_VERSION"
else
    echo "❌ Nginx 未安装"
fi

# 检查端口占用
echo "🔌 检查端口占用..."
if netstat -tuln | grep -q ":3000 "; then
    echo "⚠️  端口 3000 已被占用"
else
    echo "✅ 端口 3000 可用"
fi

if netstat -tuln | grep -q ":5432 "; then
    echo "⚠️  端口 5432 已被占用"
else
    echo "✅ 端口 5432 可用"
fi

if netstat -tuln | grep -q ":80 "; then
    echo "⚠️  端口 80 已被占用"
else
    echo "✅ 端口 80 可用"
fi

# 检查磁盘空间
echo "💾 检查磁盘空间..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo "✅ 磁盘空间充足: ${DISK_USAGE}% 已使用"
else
    echo "⚠️  磁盘空间不足: ${DISK_USAGE}% 已使用"
fi

# 检查内存
echo "🧠 检查内存..."
MEMORY_TOTAL=$(free -m | awk 'NR==2{print $2}')
MEMORY_AVAILABLE=$(free -m | awk 'NR==2{print $7}')
if [ "$MEMORY_AVAILABLE" -gt 1000 ]; then
    echo "✅ 内存充足: ${MEMORY_AVAILABLE}MB 可用"
else
    echo "⚠️  内存可能不足: ${MEMORY_AVAILABLE}MB 可用"
fi

echo ""
echo "🎯 环境检查完成！"
echo "如果所有项目都显示 ✅，说明环境准备就绪"
echo "如果有 ❌ 项目，请先安装相应的软件"

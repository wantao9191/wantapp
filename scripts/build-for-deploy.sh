#!/bin/bash

# 构建产物部署脚本
# 用于创建生产环境部署包

set -e

echo "🚀 开始构建部署包..."

# 检查必要文件
if [ ! -f "package.json" ]; then
    echo "❌ 错误：未找到 package.json 文件"
    exit 1
fi

if [ ! -f "next.config.js" ]; then
    echo "❌ 错误：未找到 next.config.js 文件"
    exit 1
fi

# 设置变量
BUILD_DIR="wantweb-build"
ARCHIVE_NAME="wantweb-build-$(date +%Y%m%d-%H%M%S).tar.gz"
BACKUP_DIR="backups"

echo "📦 构建信息："
echo "   构建目录: $BUILD_DIR"
echo "   压缩包名: $ARCHIVE_NAME"
echo "   时间: $(date)"

# 清理旧的构建目录
if [ -d "$BUILD_DIR" ]; then
    echo "🧹 清理旧的构建目录..."
    rm -rf "$BUILD_DIR"
fi

# 创建构建目录
echo "📁 创建构建目录..."
mkdir -p "$BUILD_DIR"

# 安装依赖
echo "📥 安装依赖..."
pnpm install --frozen-lockfile

# 跳过所有检查（生产构建时）
echo "⚠️  跳过所有检查（生产构建模式）..."

# 构建项目
echo "🏗️  构建项目..."
# 临时使用生产环境 ESLint 配置
cp .eslintrc.production.js .eslintrc.js
NEXT_TELEMETRY_DISABLED=1 pnpm build
# 恢复原始 ESLint 配置
git checkout .eslintrc.js 2>/dev/null || rm -f .eslintrc.js

# 验证构建结果
if [ ! -d ".next" ]; then
    echo "❌ 错误：构建失败，未找到 .next 目录"
    exit 1
fi

echo "✅ 构建成功！"

# 复制必要文件到构建目录
echo "📋 复制必要文件..."

# 复制构建产物
cp -r .next "$BUILD_DIR/"

# 复制静态资源
cp -r public "$BUILD_DIR/"

# 复制配置文件
cp package.json "$BUILD_DIR/"
cp pnpm-lock.yaml "$BUILD_DIR/"
cp next.config.js "$BUILD_DIR/"
cp tsconfig.json "$BUILD_DIR/"

# 复制数据库相关文件
if [ -d "drizzle" ]; then
    cp -r drizzle "$BUILD_DIR/"
fi

# 复制数据库配置
if [ -f "drizzle.config.ts" ]; then
    cp drizzle.config.ts "$BUILD_DIR/"
fi

# 创建生产环境专用的 package.json
echo "📦 创建生产环境 package.json..."
cat > "$BUILD_DIR/package.prod.json" << 'EOF'
{
  "name": "wantweb",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "start": "next start",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "tsx scripts/seed.ts"
  },
  "dependencies": {
    "@ant-design/icons": "^6.0.0",
    "@ant-design/nextjs-registry": "^1.1.0",
    "@ant-design/v5-patch-for-react-19": "^1.0.3",
    "antd": "^5.27.0",
    "bcryptjs": "^3.0.2",
    "clsx": "^2.0.0",
    "dayjs": "^1.11.13",
    "drizzle-kit": "^0.31.4",
    "drizzle-orm": "^0.44.4",
    "jose": "^6.0.12",
    "js-cookie": "^3.0.5",
    "next": "^15.1.0",
    "next-auth": "^4.24.11",
    "postgres": "^3.4.7",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "zod": "^3.22.4",
    "dotenv": "^17.2.1",
    "tsx": "^4.20.3"
  }
}
EOF

# 复制数据库脚本
if [ -d "scripts" ]; then
    mkdir -p "$BUILD_DIR/scripts"
    cp scripts/*.ts "$BUILD_DIR/scripts/" 2>/dev/null || true
fi

# 复制数据库 schema
if [ -d "src/db" ]; then
    mkdir -p "$BUILD_DIR/src/db"
    cp -r src/db "$BUILD_DIR/src/"
fi

# 创建生产环境配置文件
echo "⚙️  创建环境配置文件..."
cat > "$BUILD_DIR/.env.production.local" << 'EOF'
# 生产环境配置模板
# 请根据实际情况修改以下配置

# 数据库配置
# 如果数据库在同一台服务器：使用 localhost
# 如果数据库在独立服务器：使用内网IP地址
# 如果使用云数据库：使用云服务商提供的域名
DATABASE_URL="postgresql://postgres:!Wantao9191@localhost:5432/wantapp"

# Next.js 配置
NEXTAUTH_SECRET="5C345F277F4A2996678DBEE5751812AL"
NEXTAUTH_URL="http://localhost:3000"
# JWT 配置
JWT_SECRET="v4xCufXu4s"

# API 密钥（如果需要）
API_SECRET_KEY="v4xCufXu4s"
PORT=3000


# 环境
NODE_ENV="production"

DATA_ENCRYPTION_KEY="6MtTCD3v4_rladjXFdBREdaW4O6T248JR7Dr3Wu4wY4"

#文件上传 配置 
CLOUD_DISK_PATH="/www/wwwroot/uploads"
#UPLOAD_PATH=/www/wwwroot/uploads
MAX_FILE_SIZE=104857600  # 100MB
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf,"
EOF

# 创建部署说明
echo "📝 创建部署说明..."
cat > "$BUILD_DIR/DEPLOY.md" << 'EOF'
# 部署说明

## 服务器环境要求
- Node.js 18+
- pnpm
- PM2
- Docker & Docker Compose
- Nginx

## 部署步骤

### 1. 上传到服务器
```bash
scp wantweb-build-*.tar.gz root@your-server:/www/wwwroot/
```

### 2. 解压和安装
```bash
cd /www/wwwroot
tar -xzf wantweb-build-*.tar.gz
cd wantweb
pnpm install --frozen-lockfile --production
```

### 3. 配置环境变量
```bash
# 编辑 .env.production.local 文件，填入正确的配置
# 使用 vi 编辑器（大多数 Linux 系统都有）
vi .env.production.local
```

### 4. 启动数据库
```bash
docker-compose -f docker-compose.db.yml up -d
```

### 5. 数据库迁移（可选）
```bash
# 如果数据库结构有变化，运行迁移
pnpm db:migrate

# 如果需要初始化数据，运行种子
pnpm db:seed
```

### 6. 启动应用
```bash
pm2 start npm --name "wantweb" -- start
pm2 startup
pm2 save
```

### 7. 配置 Nginx

#### 方案一：宝塔面板管理（推荐）
```bash
# 1. 登录宝塔面板
# 2. 网站管理 → 找到您的网站
# 3. 配置修改 → 复制下面的配置内容
# 4. 保存并应用配置
```

#### 方案二：直接修改配置文件
```bash
# 编辑宝塔面板的Nginx配置文件
vi /www/server/panel/vhost/nginx/wantapp.cn.conf

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

## 更新部署
```bash
# 停止应用
pm2 stop wantweb

# 解压新版本
cd /www/wwwroot
tar -xzf wantweb-build-*.tar.gz
cd wantweb
pnpm install --frozen-lockfile --production

# 重启应用
pm2 restart wantweb
```

## 监控命令
```bash
pm2 status
pm2 logs wantweb
pm2 monit
```
EOF


# 创建 PM2 配置
echo "⚙️  创建 PM2 配置..."
cat > "$BUILD_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'wantweb',
    script: 'npm',
    args: 'start',
    cwd: '/www/wwwroot/wantweb',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/wantweb-error.log',
    out_file: '/var/log/pm2/wantweb-out.log',
    log_file: '/var/log/pm2/wantweb.log',
    time: true
  }]
};
EOF

# 创建部署脚本
echo "📜 创建部署脚本..."
cat > "$BUILD_DIR/deploy.sh" << 'EOF'
#!/bin/bash

# 服务器部署脚本
set -e

echo "🚀 开始部署..."

# 检查环境
if ! command -v pnpm &> /dev/null; then
    echo "❌ 错误：未安装 pnpm"
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    echo "❌ 错误：未安装 PM2"
    exit 1
fi

# 使用生产环境 package.json 并安装依赖
echo "📥 使用生产环境配置安装依赖..."
cp package.prod.json package.json
pnpm install --frozen-lockfile

# 检查环境配置
if [ ! -f ".env.production.local" ]; then
    echo "⚠️  警告：未找到 .env.production.local 文件"
    echo "请检查部署包是否完整"
    exit 1
fi

# 启动数据库（如果存在 docker-compose 文件）
if [ -f "docker-compose.db.yml" ]; then
    echo "🗄️  启动数据库..."
    docker-compose -f docker-compose.db.yml up -d
    sleep 10
fi

# 数据库迁移（可选）
if [ -f "drizzle.config.ts" ]; then
    echo "🔄 运行数据库迁移..."
    
    # 检查并安装缺失的依赖
    echo "📦 检查数据库迁移依赖..."
    if ! pnpm list dotenv > /dev/null 2>&1; then
        echo "📥 安装 dotenv 依赖..."
        pnpm add dotenv
    fi
    
    # 确保环境变量文件存在
    if [ ! -f ".env.production.local" ]; then
        echo "⚠️  未找到 .env.production.local 文件"
        echo "   请先配置环境变量文件"
        echo "   跳过数据库迁移"
    else
        # 设置生产环境变量
        export NODE_ENV=production
        
        if pnpm db:migrate; then
            echo "✅ 数据库迁移成功"
            echo "🔄 运行数据库种子数据..."
            if pnpm db:seed; then
                echo "✅ 数据库种子数据成功"
            else
                echo "⚠️  数据库种子数据失败，跳过此步骤"
            fi
        else
            echo "⚠️  数据库迁移失败，跳过此步骤"
            echo "   如果数据库结构无变化，可以忽略此错误"
        fi
    fi
else
    echo "⚠️  未找到 drizzle.config.ts，跳过数据库迁移"
fi

# 启动应用
echo "🚀 启动应用..."
pm2 start ecosystem.config.js
pm2 startup
pm2 save

echo "✅ 部署完成！"
echo "查看状态: pm2 status"
echo "查看日志: pm2 logs wantweb"
EOF

chmod +x "$BUILD_DIR/deploy.sh"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 压缩构建包
echo "📦 压缩构建包..."
# 重命名构建目录为 wantweb
mv "$BUILD_DIR" "wantweb"
tar -czf "$ARCHIVE_NAME" wantweb/
# 恢复目录名
mv "wantweb" "$BUILD_DIR"

# 移动到备份目录
mv "$ARCHIVE_NAME" "$BACKUP_DIR/"

# 清理构建目录
rm -rf "$BUILD_DIR"

echo ""
echo "🎉 构建完成！"
echo "📦 部署包位置: $BACKUP_DIR/$ARCHIVE_NAME"
echo "📏 文件大小: $(du -h "$BACKUP_DIR/$ARCHIVE_NAME" | cut -f1)"
echo ""
echo "📋 下一步："
echo "1. 上传到服务器: scp $BACKUP_DIR/$ARCHIVE_NAME root@your-server:/www/wwwroot/"
echo "2. 在服务器解压: tar -xzf $ARCHIVE_NAME"
echo "3. 运行部署脚本: ./deploy.sh"
echo ""
echo "📚 详细说明请查看 DEPLOY.md 文件"

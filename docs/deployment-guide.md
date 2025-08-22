# 部署指南

## 方案一：Vercel + Neon（推荐）

### 1. 准备数据库
1. 访问 [Neon](https://neon.tech) 创建免费 PostgreSQL 数据库
2. 获取连接字符串：`postgresql://user:pass@host/dbname`

### 2. 部署到 Vercel
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录并部署
vercel login
vercel --prod
```

### 3. 环境变量设置
在 Vercel Dashboard 中设置：
```env
DATABASE_URL=postgresql://user:pass@host/dbname
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
API_SECRET_KEY=your-api-key
NODE_ENV=production
```

### 4. 数据库迁移
```bash
# 本地执行迁移
pnpm db:push
```

## 方案二：Railway 一站式部署

### 1. 连接 GitHub
1. 访问 [Railway](https://railway.app)
2. 连接你的 GitHub 仓库

### 2. 添加 PostgreSQL
```bash
# Railway 会自动提供 DATABASE_URL
```

### 3. 环境变量
Railway Dashboard 中设置其他环境变量

## 方案三：腾讯云自建

### 1. 服务器准备
```bash
# 安装 Docker
curl -fsSL https://get.docker.com | bash
sudo systemctl start docker
sudo systemctl enable docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 创建 docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
      - NEXTAUTH_SECRET=your-secret
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app

volumes:
  postgres_data:
```

### 3. 创建 Dockerfile
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### 4. 部署
```bash
# 克隆代码
git clone your-repo
cd your-repo

# 启动服务
docker-compose up -d

# 执行数据库迁移
docker-compose exec app npm run db:push
```

## 成本对比

| 方案 | 月成本 | 适用场景 |
|------|--------|----------|
| Vercel + Neon | 免费-$20 | 个人项目、小型应用 |
| Railway | $5-$20 | 快速部署、中小型项目 |
| 腾讯云自建 | ¥10-30 | 学习、完全控制 |
| Render + Supabase | 免费-$7 | 预算有限的项目 |

## 推荐选择

- **新手**: Vercel + Neon（最简单）
- **预算紧张**: Render + Supabase
- **学习目的**: 腾讯云自建
- **商业项目**: Railway 或 Vercel Pro
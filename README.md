# My Fullstack App

基于 Next.js 15 + Turbopack + UnoCSS + Drizzle ORM + PostgreSQL 的现代全栈应用。

## 🚀 技术栈

- **前端框架**: Next.js 15 (App Router)
- **打包工具**: Turbopack (比 Webpack 更快)
- **样式框架**: UnoCSS (原子化 CSS)
- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM
- **类型安全**: TypeScript + Zod
- **开发体验**: 热重载、类型检查、ESLint

## 🛠️ 开发环境设置

### 1. 安装依赖
```bash
pnpm install
```

### 2. 环境变量配置
创建 `.env.local` 文件：
```env
DATABASE_URL="postgresql://username:password@localhost:5432/my_fullstack_app"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
API_SECRET_KEY="your-api-key"
NODE_ENV="development"
```

### 3. 数据库设置
```bash
# 生成数据库迁移文件
pnpm db:generate

# 执行数据库迁移
pnpm db:migrate

# 或者直接推送 schema 到数据库
pnpm db:push

# 打开数据库管理界面
pnpm db:studio
```

### 4. 启动开发服务器
```bash
# 使用 Turbopack (推荐，更快)
pnpm dev

# 或使用传统 Webpack
pnpm dev:webpack
```

## 📁 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 首页
├── db/                 # 数据库相关
│   ├── schema/         # 数据库 Schema
│   │   ├── users.ts    # 用户表
│   │   └── posts.ts    # 文章表
│   └── index.ts        # 数据库连接
├── components/         # React 组件
├── lib/               # 工具库
├── hooks/             # 自定义 Hooks
└── types/             # 类型定义
```

## 🎨 样式系统

使用 UnoCSS 原子化 CSS：

```tsx
// 使用预设的快捷样式
<button className="btn-primary">
  主要按钮
</button>

// 使用原子类
<div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
  内容
</div>

// 使用图标
<div className="i-heroicons-home text-xl" />
```

## 📊 数据库操作

```tsx
import { db } from '@/db'
import { users, posts } from '@/db/schema'

// 查询用户
const allUsers = await db.select().from(users)

// 创建用户
const newUser = await db.insert(users).values({
  email: 'user@example.com',
  name: 'John Doe'
}).returning()

// 关联查询
const postsWithAuthor = await db.select().from(posts).leftJoin(users, eq(posts.authorId, users.id))
```

## 🔧 可用脚本

- `pnpm dev` - 启动开发服务器 (Turbopack)
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm lint` - 代码检查
- `pnpm type-check` - 类型检查
- `pnpm test` - 运行单元测试
- `pnpm test:coverage` - 运行单元测试并生成覆盖率报告（`coverage/`）
- `pnpm db:generate` - 生成数据库迁移
- `pnpm db:migrate` - 执行数据库迁移
- `pnpm db:push` - 推送 schema 到数据库
- `pnpm db:studio` - 打开数据库管理界面

## 🚀 部署

项目可以部署到任何支持 Next.js 的平台：

- **Vercel** (推荐)
- **Netlify**
- **Railway**
- **Docker**

确保在生产环境中设置正确的环境变量。

## ✅ 单元测试与覆盖率

已集成 Vitest 测试框架与覆盖率（v8）。主要针对 `src/lib` 工具库编写了示例测试。

### 运行

```bash
pnpm test          # 运行全部测试
pnpm test:coverage # 生成覆盖率（HTML 报告位于 coverage/index.html）
```

### 当前覆盖率摘要（库 + 服务端 API）

| 覆盖项 | 覆盖率 |
| --- | --- |
| Statements | 62.67% |
| Branches | 60.99% |
| Functions | 77.41% |
| Lines | 62.67% |

范围包含：`src/lib/**/*`、`src/app/api/_utils/**/*`、`src/app/api/**/route.ts`。

可进一步为 `src/lib/https.ts`, `src/lib/antd-config.ts`, `src/lib/theme.ts`, `src/lib/validations.ts` 与更多路由补充测试以提升覆盖率。

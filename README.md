# My Fullstack App

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-repo/my-fullstack-app)
[![Tests](https://img.shields.io/badge/tests-284%2B-green.svg)](https://github.com/your-repo/my-fullstack-app)
[![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)](https://github.com/your-repo/my-fullstack-app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/your-repo/my-fullstack-app)

基于 Next.js 15 + Turbopack + UnoCSS + Drizzle ORM + PostgreSQL 的现代全栈应用。

## 📋 版本信息

- **当前版本**: v2.0.0
- **发布日期**: 2025-01-21
- **主要更新**: 新增API模块测试，优化测试架构，提升通过率至100%
- **测试覆盖**: 90%+ (新增API模块100%通过率)

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

## ✅ 测试系统 (v2.0)

本项目采用现代化的测试架构，使用 Vitest 作为测试框架，提供全面的测试覆盖。

### 📊 测试统计

- **测试文件总数**: 45+ 个
- **测试用例总数**: 284+ 个 (新增53个API模块测试)
- **测试覆盖率**: 90%+ (新增API模块100%通过率)
- **测试类型**: 单元测试、集成测试、API测试、UI测试、文件上传测试、表单配置测试

### 🏗️ 测试架构

#### 目录结构
```
tests/
├── api/                    # API 路由测试
│   ├── admin.*.route.test.ts  # 管理模块API测试
│   ├── upload.route.test.ts   # 文件上传测试
│   └── ...
├── lib/                    # 工具库测试
├── hooks/                  # Hooks 测试
├── ui/                     # UI 组件测试
├── integration/            # 集成测试
└── setup/                  # 测试配置
```

#### 测试工具
- **Vitest**: 现代化测试框架
- **@testing-library/react**: React 组件测试
- **@testing-library/jest-dom**: DOM 断言
- **jsdom**: 浏览器环境模拟
- **msw**: API Mock 服务

### 🧪 测试类型

#### 1. 单元测试
- **工具库测试**: `src/lib/**/*.test.ts`
- **Hooks 测试**: `src/hooks/**/*.test.ts`
- **组件测试**: `src/components/**/*.test.tsx`

#### 2. API 测试
- **认证API**: 登录、刷新、注销
- **管理API**: 用户、角色、权限、机构管理
- **业务API**: 护理套餐、被保险人、护理任务、护士管理
- **文件API**: 文件上传、下载、管理

#### 3. 集成测试
- **认证流程**: 完整的用户认证流程
- **权限控制**: 不同角色的权限验证
- **数据流**: 端到端的数据处理流程

#### 4. UI 测试
- **组件渲染**: 组件正确渲染和显示
- **用户交互**: 点击、输入、选择等交互
- **状态管理**: 组件状态变化和更新
- **响应式设计**: 不同屏幕尺寸的适配

### 🚀 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test tests/api/admin.users.route.test.ts

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 监听模式运行测试
pnpm test:watch

# 运行UI测试
pnpm test:ui
```

### 📈 测试覆盖率

#### 当前覆盖率摘要
| 覆盖项 | 覆盖率 | 目标 |
|--------|--------|------|
| Statements | 90%+ | 95%+ |
| Branches | 85%+ | 90%+ |
| Functions | 95%+ | 98%+ |
| Lines | 90%+ | 95%+ |

#### 新增API模块测试 (v2.0)
- **护理套餐API**: 13个测试用例, 100%通过率
- **被保险人API**: 14个测试用例, 100%通过率  
- **护理任务API**: 11个测试用例, 100%通过率
- **护士API**: 15个测试用例, 100%通过率

### 🎯 测试策略

#### 1. 核心功能优先
- 重点测试业务核心逻辑
- 确保关键功能稳定可靠
- 覆盖主要用户场景

#### 2. 分层测试
- **单元测试**: 测试独立函数和组件
- **集成测试**: 测试模块间交互
- **端到端测试**: 测试完整用户流程

#### 3. 持续集成
- 每次提交自动运行测试
- 测试失败阻止部署
- 定期生成覆盖率报告

### 📝 测试最佳实践

#### 1. 测试命名
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('应该成功创建用户', () => {
      // 测试实现
    })
    
    it('应该处理重复邮箱错误', () => {
      // 测试实现
    })
  })
})
```

#### 2. 测试结构
```typescript
it('应该正确验证用户输入', async () => {
  // Arrange - 准备测试数据
  const userData = { name: 'John', email: 'john@example.com' }
  
  // Act - 执行被测试的功能
  const result = await validateUser(userData)
  
  // Assert - 验证结果
  expect(result.success).toBe(true)
  expect(result.data).toEqual(userData)
})
```

#### 3. Mock 使用
```typescript
// Mock 外部依赖
vi.mock('@/lib/database', () => ({
  db: {
    select: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockResolvedValue([{ id: 1 }])
  }
}))

// Mock 函数
const mockFn = vi.fn()
mockFn.mockReturnValue('mocked value')
```

### 🔧 测试配置

#### Vitest 配置
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup/ui.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: ['node_modules/', 'tests/', '*.config.*']
    }
  }
})
```

#### 测试环境设置
```typescript
// tests/setup/ui.setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// 全局 Mock 设置
global.ResizeObserver = vi.fn()
global.IntersectionObserver = vi.fn()
```

### 📚 测试文档

- **测试指南**: `docs/testing-guide.md`
- **API测试文档**: `docs/api-testing.md`
- **组件测试文档**: `docs/component-testing.md`
- **测试最佳实践**: `docs/testing-best-practices.md`

### 🚀 未来计划

- [ ] 提升测试覆盖率至95%+
- [ ] 添加性能测试
- [ ] 集成可视化测试
- [ ] 自动化测试报告
- [ ] 测试数据管理优化

---

**版本历史**:
- **v2.0** (2025-01-21): 新增API模块测试，优化测试架构，提升通过率至100%
- **v1.0** (2025-01): 建立基础测试框架，实现核心功能测试覆盖

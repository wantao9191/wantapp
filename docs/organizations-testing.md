# Organizations 模块测试文档

## 概述

本文档描述了 Organizations（组织管理）模块的单元测试策略和实现。

## 测试结构

```
tests/
├── api/
│   ├── admin.organizations.route.test.ts          # 组织列表和创建 API 测试
│   └── admin.organizations.id.route.test.ts       # 组织详情 API 测试
└── ui/
    ├── OrganizationsPage.test.tsx                 # 主页面组件测试
    ├── OrganizationsUseItems.test.tsx             # useItems Hook 测试
    └── OrganizationsEditModal.test.tsx            # 编辑模态框组件测试
```

## 服务端 API 测试

### 1. 组织列表 API (GET /admin/organizations)
- ✅ 返回分页的组织列表
- ✅ 处理搜索参数（名称、状态）
- ✅ 验证分页参数

### 2. 创建组织 API (POST /admin/organizations)
- ✅ 创建新组织
- ✅ 验证请求数据

### 3. 更新组织 API (PUT /admin/organizations/[id])
- ✅ 更新组织信息
- ✅ 验证更新数据

### 4. 删除组织 API (DELETE /admin/organizations/[id])
- ✅ 软删除组织
- ✅ 处理不存在的组织

## 前端组件测试

### 1. OrganizationsPage 组件
- ✅ 渲染组织管理页面
- ✅ 处理新增、编辑、删除操作
- ✅ 处理表单提交和取消

### 2. useItems Hook
- ✅ 返回正确的表格列配置
- ✅ 返回正确的搜索表单配置

### 3. EditModal 组件
- ✅ 渲染编辑模态框
- ✅ 处理表单操作

## 运行测试

```bash
# 运行所有测试
pnpm test --run tests/api/admin.organizations*
pnpm test --run tests/ui/Organizations*

# 生成覆盖率报告
pnpm test --coverage tests/api/admin.organizations*
pnpm test --coverage tests/ui/Organizations*
```

## 测试工具

- **Vitest**: 测试运行器
- **@testing-library/react**: React 组件测试
- **Mock**: 数据库、HTTP 请求、权限验证

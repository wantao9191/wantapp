#!/bin/bash

# Admin 模块测试运行脚本
echo "🚀 开始运行 Admin 模块单元测试..."

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  未找到 node_modules，正在安装依赖...${NC}"
    npm install
fi

# 运行 API 测试
echo -e "\n${BLUE}📡 运行 API 测试...${NC}"
npm run test -- tests/api/admin.users.route.test.ts
npm run test -- tests/api/admin.users.id.route.test.ts
npm run test -- tests/api/admin.roles.route.test.ts
npm run test -- tests/api/admin.permissions.route.test.ts
npm run test -- tests/api/admin.menus.route.test.ts
npm run test -- tests/api/admin.organizations.route.test.ts

# 运行 UI 测试
echo -e "\n${BLUE}🎨 运行 UI 测试...${NC}"
npm run test -- tests/ui/admin.users.page.test.tsx
npm run test -- tests/ui/admin.users.useItems.test.tsx
npm run test -- tests/ui/admin.users.editModal.test.tsx
npm run test -- tests/ui/admin.roles.page.test.tsx
npm run test -- tests/ui/admin.roles.useItems.test.tsx
npm run test -- tests/ui/admin.permissions.page.test.tsx
npm run test -- tests/ui/admin.permissions.useItems.test.tsx
npm run test -- tests/ui/admin.menus.page.test.tsx
npm run test -- tests/ui/admin.menus.useItems.test.tsx

# 运行所有 admin 相关测试
echo -e "\n${BLUE}🔍 运行所有 Admin 模块测试...${NC}"
npm run test -- tests/api/admin.*.test.ts
npm run test -- tests/ui/admin.*.test.tsx

# 生成测试覆盖率报告
echo -e "\n${BLUE}📊 生成测试覆盖率报告...${NC}"
npm run test:coverage

echo -e "\n${GREEN}✅ Admin 模块测试完成！${NC}"
echo -e "${YELLOW}📋 测试报告已生成在 coverage/ 目录中${NC}"

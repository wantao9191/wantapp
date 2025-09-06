#!/bin/bash

# HTTP客户端刷新Token机制测试脚本

echo "🚀 开始运行HTTP客户端刷新Token机制测试..."

# 运行HTTP刷新Token机制测试
echo "📋 运行HTTP刷新Token机制测试..."
npx vitest run tests/lib/https.test.ts --reporter=verbose

echo "✅ HTTP客户端测试完成！"

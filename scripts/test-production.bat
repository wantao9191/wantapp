@echo off
setlocal EnableDelayedExpansion

echo 🏭 生产环境构建测试
echo ====================

echo 🔧 设置生产环境变量...
set NODE_ENV=production
set NODE_OPTIONS=--max-old-space-size=4096
set NEXT_TELEMETRY_DISABLED=1

echo 🧹 清理现有构建...
if exist .next rmdir /s /q .next 2>nul
if exist .next-memory rmdir /s /q .next-memory 2>nul

echo 🏗️ 执行生产构建...
echo.
echo 💡 生产环境特性:
echo    - 启用所有优化
echo    - 使用标准 .next 目录
echo    - 启用 CSS 和服务器优化
echo    - 启用 ISR 缓存
echo.

pnpm build

if !errorlevel! equ 0 (
    echo.
    echo ✅ 生产构建成功！
    echo 🚀 可以安全部署到线上环境
    echo.
    echo 📁 构建文件位置: .next/
    echo 🔍 检查构建文件...
    if exist .next\standalone (
        echo ✅ Standalone 模式构建完成
    )
    if exist .next\static (
        echo ✅ 静态资源生成完成
    )
) else (
    echo.
    echo ❌ 生产构建失败
    echo 💡 请检查代码或配置
)

echo.
pause

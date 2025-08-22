@echo off
echo 🧹 开始强力清理 Next.js 缓存...

echo ⏹️  停止所有相关进程...
taskkill /f /im node.exe 2>nul
taskkill /f /im next.exe 2>nul
taskkill /f /im pnpm.exe 2>nul

echo 🔄 等待进程完全停止...
timeout /t 2 /nobreak >nul

echo 🗑️  强力清理缓存目录...
if exist .next (
    echo   清理 .next 目录...
    attrib -r -h -s .next\*.* /s /d 2>nul
    rmdir /s /q .next 2>nul
    if exist .next rmdir /s /q .next 2>nul
)

if exist node_modules\.cache (
    echo   清理 node_modules\.cache 目录...
    rmdir /s /q node_modules\.cache 2>nul
)

if exist .turbo (
    echo   清理 .turbo 目录...
    rmdir /s /q .turbo 2>nul
)

if exist dist (
    echo   清理 dist 目录...
    rmdir /s /q dist 2>nul
)

if exist coverage (
    echo   清理 coverage 目录...
    rmdir /s /q coverage 2>nul
)

if exist .swc (
    echo   清理 .swc 目录...
    rmdir /s /q .swc 2>nul
)

echo 🧽 清理临时文件...
del /f /q *.log 2>nul
del /f /q .env.local 2>nul

echo 🔍 验证清理结果...
if exist .next (
    echo ⚠️  .next 目录仍存在，尝试再次清理...
    rmdir /s /q .next 2>nul
)

echo ✅ 强力缓存清理完成！
echo 🚀 现在可以安全运行: pnpm dev:clean
echo 💡 提示: 如果问题仍然存在，请重启命令行工具
pause

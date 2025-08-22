cat > .env.local << 'EOF'
# 数据库配置（注意容器名是 wantapp_postgres）
DATABASE_URL="postgresql://postgres:!Wantao9191@localhost:5432/wantapp"

# NextAuth 配置
NEXTAUTH_SECRET="your-super-secret-key-change-this-to-random-string"
NEXTAUTH_URL="http://你的服务器IP或域名"

# API 密钥
API_SECRET_KEY="your-api-secret-key"

# 环境
NODE_ENV="production"
EOF
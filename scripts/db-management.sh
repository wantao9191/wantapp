cat > db-manage.sh << 'EOF'
#!/bin/bash

case "$1" in
    "start")
        echo "🚀 启动数据库..."
        if docker ps -a --format "table {{.Names}}" | grep -q "myapp_postgres"; then
            docker start wantapp_postgres
        else
            docker run -d \
              --name wantapp_postgres \
              --restart unless-stopped \
              -e POSTGRES_PASSWORD=!Wantao9191 \
              -e POSTGRES_DB=wantapp \
              -e POSTGRES_USER=postgres \
              -p 5432:5432 \
              -v postgres_data:/var/lib/postgresql/data \
              postgres:15-alpine
        fi
        ;;
    "stop")
        echo "🛑 停止数据库..."
        docker stop wantapp_postgres
        ;;
    "restart")
        echo "🔄 重启数据库..."
        docker restart wantapp_postgres
        ;;
    "status")
        echo "📊 数据库状态:"
        docker ps --filter name=wantapp_postgres
        ;;
    "logs")
        echo "📝 数据库日志:"
        docker logs -f wantapp_postgres
        ;;
    "connect")
        echo "🔗 连接数据库..."
        docker exec -it wantapp_postgres psql -U postgres -d myapp
        ;;
    "backup")
        mkdir -p backups
        BACKUP_FILE="backups/backup_$(date +%Y%m%d_%H%M%S).sql"
        echo "💾 备份数据库到 $BACKUP_FILE..."
        docker exec wantapp_postgres pg_dump -U postgres wantapp > $BACKUP_FILE
        echo "✅ 备份完成: $BACKUP_FILE"
        ;;
    *)
        echo "📖 使用方法: ./db-manage.sh [start|stop|restart|status|logs|connect|backup]"
        ;;
esac
EOF

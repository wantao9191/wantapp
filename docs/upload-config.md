# 文件上传配置说明

**文档创建时间**: 2025-01-21  
**适用版本**: v1.0

## 云硬盘存储配置

### 环境变量配置

在 `.env` 文件中添加以下配置：

```bash
# 云硬盘挂载路径
UPLOAD_PATH=/mnt/cloud-disk/uploads
# 或者使用别名
CLOUD_DISK_PATH=/mnt/cloud-disk/uploads

# 文件访问基础URL
FILE_BASE_URL=/api/files
```

### 云硬盘挂载示例

假设您的云硬盘挂载在 `/mnt/cloud-disk`，可以这样配置：

```bash
# 创建上传目录
sudo mkdir -p /mnt/cloud-disk/uploads
sudo chown -R www-data:www-data /mnt/cloud-disk/uploads
sudo chmod -R 755 /mnt/cloud-disk/uploads

# 设置环境变量
export UPLOAD_PATH=/mnt/cloud-disk/uploads
```

### 目录结构

```
/mnt/cloud-disk/
├── uploads/                    # 文件存储目录
│   ├── 2023-12-01/            # 按日期分目录（可选）
│   │   ├── 1737456000000_a1b2c3d4.jpg
│   │   └── 1703123456790_e5f6g7h8.pdf
│   └── 2023-12-02/
└── ...
```

## 配置选项

### 文件限制

- **最大文件大小**: 10MB（可配置）
- **允许的文件类型**: 图片、文档、音频、视频等
- **每个用户最大文件数**: 100个

### 安全特性

- **文件名安全化**: 使用时间戳 + UUID 避免冲突
- **文件类型验证**: 严格检查 MIME 类型
- **大小限制**: 防止大文件攻击
- **权限控制**: 基于用户和角色的访问控制

## API 接口

### 上传文件

```bash
POST /api/upload
Content-Type: multipart/form-data

# 请求体
file: [文件数据]
```

### 响应示例

```json
{
  "code": 200,
  "message": "文件上传成功",
  "data": {
    "id": 1,
    "name": "example.jpg",
    "path": "/mnt/cloud-disk/uploads/1737456000000_a1b2c3d4.jpg",
    "url": "/api/files/1737456000000_a1b2c3d4.jpg",
    "size": 1024000,
    "type": "image/jpeg",
    "createTime": "2025-01-21T10:30:00Z"
  }
}
```

### 获取文件列表

```bash
GET /api/upload?page=1&pageSize=10&status=1
```

### 删除文件

```bash
DELETE /api/upload?id=1
```

## 注意事项

1. **权限设置**: 确保应用有读写云硬盘目录的权限
2. **备份策略**: 建议定期备份云硬盘数据
3. **监控**: 监控磁盘使用情况，避免空间不足
4. **安全**: 定期检查上传的文件，防止恶意文件

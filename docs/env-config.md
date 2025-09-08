# 环境变量配置说明

## CLOUD_DISK_PATH 配置详解

### 配置作用

`CLOUD_DISK_PATH` 环境变量用于指定云硬盘的挂载路径，当设置了此变量时，系统会自动启用云硬盘存储模式。

### 配置方式

#### 1. 开发环境配置

**不设置 CLOUD_DISK_PATH（推荐）**
```bash
# .env.local 文件中不设置或注释掉
# CLOUD_DISK_PATH=

# 或者设置为空
CLOUD_DISK_PATH=
```

**效果：**
- 文件存储在项目本地目录
- 通过 `/api/files/` 访问文件
- 适合本地开发和测试

#### 2. 生产环境配置

**设置云硬盘挂载路径**
```bash
# .env 文件中设置
CLOUD_DISK_PATH="/mnt/cloud-disk/uploads"
UPLOAD_PATH="http://your-server-ip:3000"
```

**效果：**
- 文件存储在云硬盘挂载目录
- 通过服务器IP直接访问文件
- 数据持久化，不占用系统盘空间

### 配置示例

#### 开发环境 (.env.local)
```bash
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/wantapp"

# JWT 配置
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"

# 文件上传配置（开发环境）
# CLOUD_DISK_PATH=  # 不设置，使用本地存储
FILE_BASE_URL="/api/files"
BASE_URL="http://localhost:3000"

# 其他配置
NODE_ENV="development"
```

#### 生产环境 (.env)
```bash
# 数据库配置
DATABASE_URL="postgresql://username:password@your-db-server:5432/wantapp"

# JWT 配置
JWT_SECRET="your-production-jwt-secret-key"
JWT_REFRESH_SECRET="your-production-jwt-refresh-secret-key"

# 文件上传配置（生产环境）
CLOUD_DISK_PATH="/mnt/cloud-disk/uploads"
UPLOAD_PATH="http://your-server-ip:3000"
BASE_URL="http://your-server-ip:3000"

# 其他配置
NODE_ENV="production"
```

### 云硬盘挂载步骤

#### 1. 挂载云硬盘
```bash
# 查看可用磁盘
sudo fdisk -l

# 创建挂载点
sudo mkdir -p /mnt/cloud-disk

# 挂载云硬盘（假设设备为 /dev/sdb1）
sudo mount /dev/sdb1 /mnt/cloud-disk

# 设置开机自动挂载
echo '/dev/sdb1 /mnt/cloud-disk ext4 defaults 0 2' | sudo tee -a /etc/fstab
```

#### 2. 创建上传目录
```bash
# 创建上传目录
sudo mkdir -p /mnt/cloud-disk/uploads

# 设置目录权限
sudo chown -R www-data:www-data /mnt/cloud-disk/uploads
sudo chmod -R 755 /mnt/cloud-disk/uploads

# 或者如果使用 Node.js 用户
sudo chown -R node:node /mnt/cloud-disk/uploads
```

#### 3. 验证配置
```bash
# 检查挂载状态
df -h | grep cloud-disk

# 检查目录权限
ls -la /mnt/cloud-disk/uploads

# 测试写入权限
sudo -u www-data touch /mnt/cloud-disk/uploads/test.txt
```

### 配置逻辑说明

#### 代码中的判断逻辑
```typescript
// 在 upload-config.ts 中
export const defaultUploadConfig: UploadConfig = {
  // 云硬盘本地存储路径
  storagePath: process.env.CLOUD_DISK_PATH || '/var/uploads',
  // 文件访问URL基础路径
  storageDir: process.env.UPLOAD_PATH || 'http://localhost:3000',
  // 是否使用云存储（根据 CLOUD_DISK_PATH 是否存在判断）
  useCloudStorage: !!process.env.CLOUD_DISK_PATH,
}
```

#### 自动切换机制
- **有 CLOUD_DISK_PATH**：启用云硬盘存储模式
- **无 CLOUD_DISK_PATH**：使用本地存储模式

### 常见问题

#### 1. 权限问题
```bash
# 错误：Permission denied
# 解决：检查目录权限
sudo chown -R www-data:www-data /mnt/cloud-disk/uploads
sudo chmod -R 755 /mnt/cloud-disk/uploads
```

#### 2. 路径不存在
```bash
# 错误：ENOENT: no such file or directory
# 解决：确保目录存在
sudo mkdir -p /mnt/cloud-disk/uploads
```

#### 3. 挂载失败
```bash
# 错误：mount: /mnt/cloud-disk: mount point does not exist
# 解决：创建挂载点
sudo mkdir -p /mnt/cloud-disk
```

### 最佳实践

1. **开发环境**：不设置 `CLOUD_DISK_PATH`，使用本地存储
2. **生产环境**：设置 `CLOUD_DISK_PATH`，使用云硬盘存储
3. **权限设置**：确保应用用户有读写权限
4. **备份策略**：定期备份云硬盘数据
5. **监控**：监控磁盘使用情况，避免空间不足

### 环境变量优先级

1. `process.env.CLOUD_DISK_PATH` - 云硬盘挂载路径
2. `process.env.UPLOAD_PATH` - 文件访问基础URL
3. 默认值 - 如果环境变量未设置

这样的配置方式确保了开发和生产环境的灵活切换，同时保证了数据的安全性和持久性。

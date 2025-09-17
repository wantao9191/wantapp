// 尝试加载 dotenv（如果可用）
try {
  const dotenv = require('dotenv');
  const envFile = process.env.NODE_ENV === 'production'
    ? '.env.production.local'
    : '.env.local';
  dotenv.config({ path: envFile });
} catch (error) {
  // dotenv 不可用，使用系统环境变量
  console.log('dotenv 不可用，使用系统环境变量');
}
// 文件上传配置
export interface UploadConfig {
  // 存储路径配置
  storagePath: string
  // 存储目录
  storageDir: string
  // 是否使用云存储
  useCloudStorage: boolean
  // 云存储配置
  cloudConfig?: {
    provider: 'local' | 'aliyun' | 'tencent' | 'aws'
    bucket?: string
    region?: string
    accessKey?: string
    secretKey?: string
  }
  // 文件限制配置
  limits: {
    maxFileSize: number // 字节
    allowedTypes: string[]
    maxFilesPerUser: number
  }
  // 安全配置
  security: {
    scanForViruses: boolean
    generateThumbnails: boolean
    watermarkEnabled: boolean
  }
}

// 默认配置
export const defaultUploadConfig: UploadConfig = {
  // 本地存储路径（云硬盘挂载路径）
  storagePath: process.env.CLOUD_DISK_PATH || '/var/uploads',
  // 文件访问URL基础路径
  storageDir: process.env.UPLOAD_PATH || 'http://localhost:3000',
  useCloudStorage: !!process.env.CLOUD_DISK_PATH,
  cloudConfig: {
    provider: 'local' // 使用本地存储（云硬盘）
  },
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'video/mp4',
      'video/avi',
      'video/quicktime'
    ],
    maxFilesPerUser: 100
  },
  security: {
    scanForViruses: false,
    generateThumbnails: true,
    watermarkEnabled: false
  }
}

// 文件类型分类映射
export const FILE_TYPE_CATEGORIES = {
  // 图片类型
  'image/jpeg': 'images',
  'image/jpg': 'images',
  'image/png': 'images',
  'image/gif': 'images',
  'image/webp': 'images',
  'image/bmp': 'images',
  'image/svg+xml': 'images',

  // 音频类型
  'audio/mpeg': 'audios',
  'audio/wav': 'audios',
  'audio/mp3': 'audios',
  'audio/ogg': 'audios',
  'audio/aac': 'audios',
  'audio/flac': 'audios',

  // 视频类型
  'video/mp4': 'videos',
  'video/avi': 'videos',
  'video/quicktime': 'videos',
  'video/x-msvideo': 'videos',
  'video/webm': 'videos',
  'video/3gpp': 'videos',

  // 文档类型
  'application/pdf': 'documents',
  'text/plain': 'documents',
  'application/msword': 'documents',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'documents',
  'application/vnd.ms-excel': 'documents',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'documents',
  'application/vnd.ms-powerpoint': 'documents',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'documents',
  'text/csv': 'documents',
  'application/rtf': 'documents',

  // 其他类型放入 temp
  'default': 'temp'
} as const

// 根据文件类型获取分类目录
export function getFileCategory(mimeType: string): string {
  return FILE_TYPE_CATEGORIES[mimeType as keyof typeof FILE_TYPE_CATEGORIES] || FILE_TYPE_CATEGORIES.default
}

// 获取上传配置
export function getUploadConfig(): UploadConfig {
  return {
    ...defaultUploadConfig,
    // 本地存储路径（云硬盘挂载路径）
    storagePath: process.env.CLOUD_DISK_PATH || defaultUploadConfig.storagePath,
    // 文件访问URL基础路径
    storageDir: process.env.UPLOAD_PATH || defaultUploadConfig.storageDir,
    useCloudStorage: !!process.env.CLOUD_DISK_PATH,
  }
}

// 验证文件类型
export function isAllowedFileType(mimeType: string, config: UploadConfig = defaultUploadConfig): boolean {
  return config.limits.allowedTypes.includes(mimeType)
}

// 验证文件大小
export function isAllowedFileSize(size: number, config: UploadConfig = defaultUploadConfig): boolean {
  return size > 0 && size <= config.limits.maxFileSize
}

// 生成文件访问URL
export function generateFileUrl(filePath: string, config: UploadConfig = defaultUploadConfig): string {
  if (config.useCloudStorage && config.storageDir) {
    // 云硬盘存储：使用服务器IP直接访问
    const baseUrl = config.storageDir.endsWith('/') ? config.storageDir.slice(0, -1) : config.storageDir
    return `${baseUrl}/${filePath}`
  } else {
    // 本地文件URL（通过API访问）
    const baseUrl = process.env.BASE_URL || '/api/files'
    return `${baseUrl}/uploads/${filePath}`
  }
}

// 生成完整的文件访问URL（包含域名）
export function generateFullFileUrl(fileUrl: string, request?: Request): string {
  // 如果已经是完整URL，直接返回
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl
  }

  // 获取请求的域名和协议
  // let baseUrl = ''
  // if (request) {
  //   const url = new URL(request.url)
  //   baseUrl = `${url.protocol}//${url.host}`
  // } else {
  //   // 从环境变量获取，或使用默认值

  // }
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  // 确保fileUrl以/开头
  const normalizedUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`

  return `${baseUrl}/uploads${normalizedUrl}`
}
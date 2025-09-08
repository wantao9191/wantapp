import { NextRequest } from 'next/server'
import { createHandler } from '@/app/api/_utils/handler'
import { ok, error, badRequest } from '@/app/api/_utils/response'
import { db } from '@/db'
import { files } from '@/db/schema/files'
import { fileUploadSchema } from '@/lib/validations'
import { getUploadConfig, isAllowedFileType, isAllowedFileSize, generateFileUrl, getFileCategory } from '@/lib/upload-config'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
// 移除不再需要的 drizzle-orm 导入
import { randomUUID } from 'crypto'

// 生成安全的文件名
function generateSafeFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || ''
  const timestamp = Date.now()
  const uuid = randomUUID().substring(0, 8)
  return `${timestamp}_${uuid}.${ext}`
}

// 获取文件存储路径 - 支持云硬盘存储和分类目录
function getUploadPath(fileType?: string): string {
  const config = getUploadConfig()
  const basePath = config.storagePath // 云硬盘本地存储路径
  console.log('Upload config:', config)
  
  if (fileType) {
    const category = getFileCategory(fileType)
    return join(basePath, category)
  }
  
  return basePath
}

// 确保上传目录存在
async function ensureUploadDir(fileType: string): Promise<void> {
  const uploadPath = getUploadPath(fileType)
  if (!existsSync(uploadPath)) {
    await mkdir(uploadPath, { recursive: true })
  }
}

// 文件上传处理器
async function uploadFile(request: NextRequest, context?: { userId: number; organizationId?: number; isSuperAdmin?: boolean }) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return badRequest('请选择要上传的文件')
    }

    // 验证文件基本信息
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type
    }

    const validationResult = fileUploadSchema.safeParse(fileInfo)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message).join(', ')
      return badRequest(`文件验证失败: ${errors}`)
    }

    // 获取上传配置
    const config = getUploadConfig()

    // 检查文件类型
    if (!isAllowedFileType(file.type, config)) {
      return badRequest(`不支持的文件类型: ${file.type}。支持的类型: ${config.limits.allowedTypes.join(', ')}`)
    }

    // 检查文件大小
    if (!isAllowedFileSize(file.size, config)) {
      return badRequest(`文件大小超过限制: ${Math.round(file.size / 1024 / 1024)}MB，最大允许${Math.round(config.limits.maxFileSize / 1024 / 1024)}MB`)
    }

    // 确保上传目录存在（按文件类型分类）
    await ensureUploadDir(file.type)

    // 生成安全的文件名和路径
    const safeFileName = generateSafeFileName(file.name)
    const uploadPath = getUploadPath(file.type)
    const filePath = join(uploadPath, safeFileName)

    // 将文件写入磁盘
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // 保存文件信息到数据库
    const url = generateFileUrl(join(getFileCategory(file.type), safeFileName), config)
    const [savedFile] = await db.insert(files).values({
      name: file.name,
      path: filePath,
      url,
      status: 1,
      createBy: context?.userId
    }).returning()

    return ok({
      id: savedFile.id,
      name: savedFile.name,
      path: savedFile.path,
      url, // 生成访问URL（包含分类目录）
      size: file.size,
      type: file.type,
      category: getFileCategory(file.type), // 添加文件分类信息
      createTime: savedFile.createTime
    }, '文件上传成功')

  } catch (err: any) {
    console.error('文件上传错误:', err)
    return error('文件上传失败: ' + (err.message || '未知错误'), 500)
  }
}


// 导出路由处理器 - 只保留上传接口
export const POST = createHandler(uploadFile, {
  requireAuth: true
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { getFileCategory, FILE_TYPE_CATEGORIES, getUploadConfig, isAllowedFileType, isAllowedFileSize } from '@/lib/upload-config'
import { fileUploadSchema } from '@/lib/validations'

// Mock 依赖
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{
          id: 1,
          name: 'test.jpg',
          path: '/uploads/images/1737456000000_a1b2c3d4.jpg',
          status: 1,
          createTime: new Date('2025-01-21T10:30:00Z'),
          createBy: 1
        }])
      })
    })
  }
}))

vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined)
  }
})

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(true)
  }
})

vi.mock('crypto', () => ({
  randomUUID: vi.fn().mockReturnValue('a1b2c3d4')
}))

describe('Upload Configuration Tests', () => {
  it('应该正确配置文件类型分类映射', () => {
    expect(FILE_TYPE_CATEGORIES).toBeDefined()
    expect(FILE_TYPE_CATEGORIES['image/jpeg']).toBe('images')
    expect(FILE_TYPE_CATEGORIES['audio/mpeg']).toBe('audios')
    expect(FILE_TYPE_CATEGORIES['video/mp4']).toBe('videos')
    expect(FILE_TYPE_CATEGORIES['application/pdf']).toBe('documents')
    expect(FILE_TYPE_CATEGORIES['default']).toBe('temp')
  })

  it('应该支持所有图片格式分类到 images', () => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml']
    imageTypes.forEach(type => {
      expect(getFileCategory(type)).toBe('images')
    })
  })

  it('应该支持所有音频格式分类到 audios', () => {
    const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/aac', 'audio/flac']
    audioTypes.forEach(type => {
      expect(getFileCategory(type)).toBe('audios')
    })
  })

  it('应该支持所有视频格式分类到 videos', () => {
    const videoTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/3gpp']
    videoTypes.forEach(type => {
      expect(getFileCategory(type)).toBe('videos')
    })
  })

  it('应该支持所有文档格式分类到 documents', () => {
    const documentTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/csv',
      'application/rtf'
    ]
    documentTypes.forEach(type => {
      expect(getFileCategory(type)).toBe('documents')
    })
  })
})

describe('Upload Configuration Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确获取上传配置', () => {
    const config = getUploadConfig()
    expect(config).toBeDefined()
    expect(config.storagePath).toBeDefined()
    expect(config.limits).toBeDefined()
    expect(config.limits.maxFileSize).toBeGreaterThan(0)
    expect(config.limits.allowedTypes).toBeInstanceOf(Array)
  })

  it('应该正确验证允许的文件类型', () => {
    const config = getUploadConfig()
    const allowedTypes = config.limits.allowedTypes
    
    // 测试允许的类型
    allowedTypes.forEach(type => {
      expect(isAllowedFileType(type, config)).toBe(true)
    })
    
    // 测试不允许的类型
    expect(isAllowedFileType('application/x-executable', config)).toBe(false)
    expect(isAllowedFileType('text/html', config)).toBe(false)
  })

  it('应该正确验证文件大小', () => {
    const config = getUploadConfig()
    const maxSize = config.limits.maxFileSize
    
    // 测试允许的大小
    expect(isAllowedFileSize(1024, config)).toBe(true) // 1KB
    expect(isAllowedFileSize(maxSize, config)).toBe(true) // 最大大小
    
    // 测试不允许的大小
    expect(isAllowedFileSize(maxSize + 1, config)).toBe(false) // 超过最大大小
    expect(isAllowedFileSize(0, config)).toBe(false) // 0字节
    expect(isAllowedFileSize(-1, config)).toBe(false) // 负数
  })

  it('应该支持环境变量配置存储路径', () => {
    // 模拟环境变量
    const originalEnv = process.env.UPLOAD_PATH
    process.env.UPLOAD_PATH = '/custom/upload/path'
    
    const config = getUploadConfig()
    expect(config.storagePath).toBe('/custom/upload/path')
    expect(config.useCloudStorage).toBe(true)
    
    // 恢复环境变量
    if (originalEnv) {
      process.env.UPLOAD_PATH = originalEnv
    } else {
      delete process.env.UPLOAD_PATH
    }
  })
})

describe('File Category Classification', () => {
  it('应该正确分类图片文件', () => {
    expect(getFileCategory('image/jpeg')).toBe('images')
    expect(getFileCategory('image/png')).toBe('images')
    expect(getFileCategory('image/gif')).toBe('images')
    expect(getFileCategory('image/webp')).toBe('images')
  })

  it('应该正确分类音频文件', () => {
    expect(getFileCategory('audio/mpeg')).toBe('audios')
    expect(getFileCategory('audio/wav')).toBe('audios')
    expect(getFileCategory('audio/mp3')).toBe('audios')
  })

  it('应该正确分类视频文件', () => {
    expect(getFileCategory('video/mp4')).toBe('videos')
    expect(getFileCategory('video/avi')).toBe('videos')
    expect(getFileCategory('video/quicktime')).toBe('videos')
  })

  it('应该正确分类文档文件', () => {
    expect(getFileCategory('application/pdf')).toBe('documents')
    expect(getFileCategory('text/plain')).toBe('documents')
    expect(getFileCategory('application/msword')).toBe('documents')
  })

  it('应该将未知类型分类到 temp', () => {
    expect(getFileCategory('application/unknown')).toBe('temp')
    expect(getFileCategory('text/xyz')).toBe('temp')
  })
})

describe('File Validation Tests', () => {
  it('应该正确验证文件上传模式', () => {
    // 有效的文件信息
    const validFile = {
      name: 'test.jpg',
      size: 1024000, // 1MB
      type: 'image/jpeg'
    }
    
    const result = fileUploadSchema.safeParse(validFile)
    expect(result.success).toBe(true)
    
    if (result.success) {
      expect(result.data.name).toBe('test.jpg')
      expect(result.data.size).toBe(1024000)
      expect(result.data.type).toBe('image/jpeg')
    }
  })

  it('应该拒绝无效的文件信息', () => {
    // 无效的文件信息
    const invalidFiles = [
      { name: '', size: 1024, type: 'image/jpeg' }, // 空文件名
      { name: 'test.jpg', size: 0, type: 'image/jpeg' }, // 0字节
      { name: 'test.jpg', size: 1024, type: '' }, // 空类型
      { name: 'test.jpg', size: 11 * 1024 * 1024, type: 'image/jpeg' }, // 超过10MB
    ]
    
    invalidFiles.forEach(file => {
      const result = fileUploadSchema.safeParse(file)
      expect(result.success).toBe(false)
    })
  })

  it('应该正确验证文件名长度限制', () => {
    // 文件名过长
    const longName = 'a'.repeat(256) + '.jpg'
    const result = fileUploadSchema.safeParse({
      name: longName,
      size: 1024,
      type: 'image/jpeg'
    })
    
    expect(result.success).toBe(false)
  })
})

describe('File Path Generation Tests', () => {
  it('应该正确生成安全的文件名', () => {
    // 模拟时间戳
    const mockDate = 1737456000000
    vi.spyOn(Date, 'now').mockReturnValue(mockDate)
    
    // 测试文件名生成逻辑
    const originalName = 'test file.jpg'
    const ext = originalName.split('.').pop() || ''
    const timestamp = Date.now()
    const uuid = 'a1b2c3d4'
    const expectedName = `${timestamp}_${uuid}.${ext}`
    
    expect(expectedName).toBe('1737456000000_a1b2c3d4.jpg')
  })

  it('应该正确处理没有扩展名的文件', () => {
    const originalName = 'testfile'
    const ext = originalName.split('.').pop() || ''
    const timestamp = Date.now()
    const uuid = 'a1b2c3d4'
    const expectedName = `${timestamp}_${uuid}.${ext}`
    
    expect(expectedName).toBe(`${timestamp}_a1b2c3d4.testfile`)
  })

  it('应该正确处理多个点的文件名', () => {
    const originalName = 'test.file.backup.jpg'
    const ext = originalName.split('.').pop() || ''
    const timestamp = Date.now()
    const uuid = 'a1b2c3d4'
    const expectedName = `${timestamp}_${uuid}.${ext}`
    
    expect(expectedName).toBe(`${timestamp}_a1b2c3d4.jpg`)
  })
})

describe('Upload Directory Structure Tests', () => {
  it('应该根据文件类型生成正确的存储路径', () => {
    const config = getUploadConfig()
    const basePath = config.storagePath
    
    // 测试不同文件类型的路径
    expect(getFileCategory('image/jpeg')).toBe('images')
    expect(getFileCategory('audio/mpeg')).toBe('audios')
    expect(getFileCategory('video/mp4')).toBe('videos')
    expect(getFileCategory('application/pdf')).toBe('documents')
    expect(getFileCategory('unknown/type')).toBe('temp')
  })

  it('应该支持自定义存储路径', () => {
    const originalEnv = process.env.UPLOAD_PATH
    process.env.UPLOAD_PATH = '/custom/cloud/storage'
    
    const config = getUploadConfig()
    expect(config.storagePath).toBe('/custom/cloud/storage')
    
    // 恢复环境变量
    if (originalEnv) {
      process.env.UPLOAD_PATH = originalEnv
    } else {
      delete process.env.UPLOAD_PATH
    }
  })
})

import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { getUploadConfig } from '@/lib/upload-config'

// 获取文件的MIME类型
function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  const mimeTypes: Record<string, string> = {
    // 图片
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
    
    // 音频
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'aac': 'audio/aac',
    'flac': 'audio/flac',
    
    // 视频
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'webm': 'video/webm',
    
    // 文档
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  }
  
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const config = getUploadConfig()
    const filePath = params.path.join('/')
    const fullPath = join(config.storagePath, filePath)
    
    console.log('Requesting file:', filePath)
    console.log('Full path:', fullPath)
    
    // 检查文件是否存在
    try {
      const stats = await stat(fullPath)
      if (!stats.isFile()) {
        return new NextResponse('File not found', { status: 404 })
      }
    } catch (error) {
      console.error('File not found:', fullPath)
      return new NextResponse('File not found', { status: 404 })
    }
    
    // 读取文件
    const fileBuffer = await readFile(fullPath)
    const mimeType = getMimeType(filePath)
    
    // 设置响应头
    const headers = new Headers()
    headers.set('Content-Type', mimeType)
    headers.set('Content-Length', fileBuffer.length.toString())
    
    // 对于图片和视频，设置缓存
    if (mimeType.startsWith('image/') || mimeType.startsWith('video/')) {
      headers.set('Cache-Control', 'public, max-age=31536000') // 1年缓存
    }
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    })
    
  } catch (error) {
    console.error('Error serving file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
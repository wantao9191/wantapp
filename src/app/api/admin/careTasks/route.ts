import { NextRequest } from 'next/server'
import { createHandler, HandlerContext } from '../../_utils/handler'
import { pageSchema, careTaskSchema } from '@/lib/validations'
import { careTasks, files } from '@/db/schema'
import { eq, like, and, count } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '@/db'
import { paginatedSimple } from '../../_utils/response'
import { generateFullFileUrl } from '@/lib/upload-config'
export const GET = createHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page')
  const pageSize = searchParams.get('pageSize')
  const name = searchParams.get('name') || ''
  const status = searchParams.get('status')
  const pageParams = pageSchema.safeParse({ page: Number(page), pageSize: Number(pageSize) })
  if (!pageParams.success) {
    throw new Error(pageParams.error.errors[0].message)
  }
  const whereConditions = [eq(careTasks.deleted, false)]
  if (name) {
    whereConditions.push(like(careTasks.name, `%${name}%`))
  }
  if (status) {
    whereConditions.push(eq(careTasks.status, Number(status)))
  }
  const cover = alias(files, 'cover')
  const audio = alias(files, 'audio')
  const [contents, totalResult] = await Promise.all([
    db.select({
      id: careTasks.id,
      name: careTasks.name,
      description: careTasks.description,
      coverId: { id: careTasks.coverId, name: cover.sourceName, url: cover.url },
      audioId: { id: careTasks.audioId, name: audio.sourceName, url: audio.url },
      status: careTasks.status,
      createTime: careTasks.createTime,
      minDuration: careTasks.minDuration,
      maxDuration: careTasks.maxDuration,
      level: careTasks.level
    })
      .from(careTasks)
      .leftJoin(cover, eq(careTasks.coverId, cover.id))
      .leftJoin(audio, eq(careTasks.audioId, audio.id))
      .where(and(...whereConditions))
      .limit(pageParams.data.pageSize)
      .offset((pageParams.data.page - 1) * pageParams.data.pageSize)
      .orderBy(careTasks.createTime),
    db.select({ count: count() })
      .from(careTasks)
      .where(and(...whereConditions))
  ])
  contents.map((item:any) => {
    item.coverId.url = generateFullFileUrl(item.coverId.url)
    item.audioId.url = generateFullFileUrl(item.audioId.url)
  })
  const total = totalResult[0]?.count || 0
  return paginatedSimple(contents, pageParams.data.page, pageParams.data.pageSize, total)
}, {
  permission: 'caretask:read',
  requireAuth: true
})

export const POST = createHandler(async (request: NextRequest, context?: HandlerContext) => {
  const params = careTaskSchema.safeParse(await request.json())
  if (!params.success) {
    console.log(params.error)
    throw new Error(params.error.errors[0].message)
  }
  const { coverId, audioId } = params.data
  const [cover, audio] = await Promise.all([
    db.select().from(files).where(eq(files.id, coverId)),
    db.select().from(files).where(eq(files.id, audioId))
  ])
  if (!cover[0]) {
    throw new Error('封面不存在')
  }
  if (!audio[0]) {
    throw new Error('音频不存在')
  }
  // 使用事务确保数据一致性
  await db.transaction(async (tx) => {
    // 更新封面文件描述
    await tx.update(files).set({
      sourceName: `${params.data.name}护理任务封面`
    }).where(eq(files.id, cover[0].id))

    // 更新音频文件描述
    await tx.update(files).set({
      sourceName: `${params.data.name}护理任务音频`
    }).where(eq(files.id, audio[0].id))

    // 创建护理任务
    await tx.insert(careTasks).values(params.data).returning()
  })
  return "ok"
}, {
  permission: 'caretask:write',
  requireAuth: true
})
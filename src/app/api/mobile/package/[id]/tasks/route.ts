import { createHandler } from "@/app/api/_utils/handler";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { careTasks, carePackages, files } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { CommonStatus } from "@/types/enums";
import { generateFullFileUrl } from "@/lib/upload-config";

export const GET = createHandler(async (request: NextRequest, params, context) => {
  const { id } = params;

  // 1. 先查询 package 获取关联的 task IDs
  const packageData = await db
    .select()
    .from(carePackages)
    .where(and(eq(carePackages.id, Number(id)), eq(carePackages.deleted, false), eq(carePackages.status, CommonStatus.ENABLED)))
    .limit(1);

  if (!packageData.length || !packageData[0].tasks) {
    throw new Error('套餐不存在或已删除,请联系管理员');
  }

  const taskIds = packageData[0].tasks as number[];

  if (!taskIds.length) {
    throw new Error('服务任务不存在或已删除,请联系管理员');
  }

  // 2. 创建 files 表的别名，用于关联封面和音频
  const cover = alias(files, 'cover');
  const audio = alias(files, 'audio');

  // 3. 根据 task IDs 查询具体的 task 信息，并关联文件表
  const tasks = await db
    .select({
      id: careTasks.id,
      name: careTasks.name,
      description: careTasks.description,
      cover: {
        id: careTasks.coverId,
        name: cover.sourceName,
        url: cover.url,
      },
      audio: {
        id: careTasks.audioId,
        name: audio.sourceName,
        url: audio.url,
      },
      minDuration: careTasks.minDuration,
      maxDuration: careTasks.maxDuration,
      level: careTasks.level,
    })
    .from(careTasks)
    .leftJoin(cover, eq(careTasks.coverId, cover.id))
    .leftJoin(audio, eq(careTasks.audioId, audio.id))
    .where(and(inArray(careTasks.id, taskIds), eq(careTasks.deleted, false), eq(careTasks.status, CommonStatus.ENABLED)));

  // 4. 格式化返回数据，生成完整的文件 URL
  const careTasksList = tasks.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    cover: item.cover.url ? {
      id: item.cover.id,
      name: item.cover.name,
      url: generateFullFileUrl(item.cover.url),
    } : null,
    audio: item.audio.url ? {
      id: item.audio.id,
      name: item.audio.name,
      url: generateFullFileUrl(item.audio.url),
    } : null,
    minDuration: item.minDuration,
    maxDuration: item.maxDuration,
    level: item.level,
  }));

  return careTasksList;
}, {
  requireAuth: true,
  hasParams: true,
  source: 'mobile',
});
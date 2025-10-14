import { pgTable, varchar, timestamp, integer, text, json, boolean } from 'drizzle-orm/pg-core';
import { users, organizations } from './systems';
import { personInfo } from './person';
import { files } from './files';
import { 
  CareRecordStatus, 
  CareRecordAlertStatus, 
  CareTaskStatus, 
  CommonStatus,
  CareTaskLevel 
} from '@/types/enums';

// 护理任务表
export const careTasks = pgTable('care_tasks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  coverId: integer('coverId').references(() => files.id),
  audioId: integer('audioId').references(() => files.id),
  minDuration: integer('min_duration'),
  maxDuration: integer('max_duration'),
  level: varchar('level', { length: 50 }).$type<CareTaskLevel>(),
  status: integer('status').default(CommonStatus.ENABLED), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  deleted: boolean('deleted').default(false),
});

// 护理计划（套餐）表
export const carePackages = pgTable('care_packages', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  organizationId: integer('organization_id').references(() => organizations.id),
  minDuration: integer('min_duration'),
  maxDuration: integer('max_duration'),
  name: varchar('name', { length: 50 }).notNull(),
  tasks: json('tasks').$type<number[]>(),
  description: text('description'),
  status: integer('status').default(CommonStatus.ENABLED), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  deleted: boolean('deleted').default(false),
});

// 排班计划表
export const schedulePlans = pgTable('schedule_plans', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  organizationId: integer('organization_id').references(() => organizations.id),
  nurseId: integer('nurse_id').references(() => users.id),
  insuredId: integer('insured_id').references(() => personInfo.id),
  packageId: integer('package_id').references(() => carePackages.id),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  duration: integer('duration').notNull(),
  description: text('description'),
  status: integer('status').default(CommonStatus.ENABLED), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  deleted: boolean('deleted').default(false),
});

// 护理记录表
export const careRecords = pgTable('care_records', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  schedulePlanId: integer('schedule_plan_id').references(() => schedulePlans.id),
  organizationId: integer('organization_id').references(() => organizations.id),
  startServiceTime: timestamp('start_service_time'),
  endServiceTime: timestamp('end_service_time'),
  signInTime: timestamp('sign_in_time'),
  signOutTime: timestamp('sign_out_time'),
  signInLocation: varchar('sign_in_location', { length: 255 }),
  signInLocationAddress: varchar('sign_in_location_address', { length: 255 }),
  signOutLocation: varchar('sign_out_location', { length: 255 }),
  signInPhoto: integer('sign_in_photo'),
  signOutPhoto: integer('sign_out_photo'),
  signOutLocationAddress: varchar('sign_out_location_address', { length: 255 }),
  description: text('description'),
  status: integer('status').default(CareRecordStatus.NOT_STARTED), // 0: 未开始, 1: 已签到, 2: 服务中, 3: 已签退/服务结束, 4: 请假, 5: 取消服务, 6: 推迟服务
  alertStatus: integer('alert_status').default(CareRecordAlertStatus.NORMAL), // 0: 无异常, 1: 迟到, 2: 早退
  createTime: timestamp('create_time').defaultNow(),
  deleted: boolean('deleted').default(false),
});

// 护理记录[护理任务]表
export const careRecordTasks = pgTable('care_record_tasks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  careRecordId: integer('care_record_id').references(() => careRecords.id),
  careTaskId: integer('care_task_id').references(() => careTasks.id),
  status: integer('status').default(CareTaskStatus.COMPLETED), // 0: 未完成, 1: 已完成
  files: json('files').$type<number[]>(),
  createTime: timestamp('create_time').defaultNow(),
  deleted: boolean('deleted').default(false),
  description: text('description'),
});
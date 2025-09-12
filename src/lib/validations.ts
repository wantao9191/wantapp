import { z } from 'zod'
import { validateIdCard } from './utils'
export const loginSchema = z.object({
  username: z.string()
    .trim()
    .min(3, { message: '用户名至少3个字符' })
    .max(20, { message: '用户名最多20个字符' })
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*[a-zA-Z0-9]$/, {
      message: '用户名只能包含字母、数字、连字符和下划线，且不能以数字开头，不能以连字符或下划线结尾'
    }),
  password: z.string().trim().min(1, { message: '请输入密码' }),
  code: z.string().trim().length(4, { message: '验证码为4位' }),
})
export const pageSchema = z.object({
  page: z.number().min(1, { message: '页码不能小于1' }),
  pageSize: z.number().min(1, { message: '每页条数不能小于1' }),
})
export const organizationSchema = z.object({
  name: z.string().trim().min(2, { message: '机构名称至少2个字符' }).max(50, { message: '机构名称最多50个字符' }),
  status: z.number().optional(),
  address: z.string().optional(),
  phone: z.string().min(11, { message: '请输入正确的手机号' }).max(11, { message: '请输入正确的手机号' }).optional(),
  email: z.string().email().optional(),
  operator: z.string().optional(),
  setupTime: z.string().optional(),
  description: z.string().optional(),
})

export const roleSchema = z.object({
  name: z.string().trim().min(2, { message: '角色名称至少2个字符' }).max(50, { message: '角色名称最多50个字符' }),
  status: z.number().optional(),
  description: z.string().optional(),
  menus: z.array(z.number()).optional(),
  permissions: z.array(z.number()).optional(),
})
export const menuSchema = z.object({
  name: z.string().trim().min(2, { message: '菜单名称至少2个字符' }).max(50, { message: '菜单名称最多50个字符' }),
  status: z.number().optional(),
  description: z.string().optional(),
  parentId: z.number().optional(),
  path: z.string().optional(),
  icon: z.string().optional(),
  sort: z.number().optional(),
})
export const permissionSchema = z.object({
  name: z.string().trim().min(2, { message: '权限名称至少2个字符' }).max(50, { message: '权限名称最多50个字符' }),
  status: z.number().optional(),
  code: z.string().trim().min(1, { message: '请输入权限编码' }),
  menuId: z.number().min(1, { message: '请选择菜单' }),
  description: z.string().optional(),
})
export const userSchema = z.object({
  name: z.string().trim().min(2, { message: '用户名称至少2个字符' }).max(50, { message: '用户名称最多50个字符' }),
  username: z.string()
    .trim()
    .min(3, { message: '用户名至少3个字符' })
    .max(20, { message: '用户名最多20个字符' })
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*[a-zA-Z0-9]$/, {
      message: '用户名只能包含字母、数字、连字符和下划线，且不能以数字开头，不能以连字符或下划线结尾'
    }),
  phone: z.string().min(11, { message: '请输入正确的手机号' }).max(11, { message: '请输入正确的手机号' }),
  status: z.number().optional(),
  email: z.string().email().optional(),
  roles: z.array(z.number()).optional(),
  organizationId: z.number().optional(),
  description: z.string().optional(),
})

// 护理任务校验规则
export const careTaskSchema = z.object({
  name: z.string().trim().min(2, { message: '护理任务名称至少2个字符' }).max(50, { message: '护理任务名称最多50个字符' }),
  status: z.number(),
  description: z.string().optional(),
  coverId: z.number().min(1, { message: '请选择封面' }),
  audioId: z.number().min(1, { message: '请选择音频' }),
  minDuration: z.number().min(0, { message: '最小时长不能小于0' }),
  maxDuration: z.number().min(0, { message: '最大时长不能小于0' }),
  level: z.string(),
}).refine((data) => {
  // 如果两个时长都提供了，验证 minDuration 不能超过 maxDuration
  if (data.minDuration !== undefined && data.maxDuration !== undefined) {
    return data.minDuration <= data.maxDuration;
  }
  return true;
}, {
  message: '最小时长不能超过最大时长',
  path: ['minDuration'], // 错误信息显示在 minDuration 字段上
})
// 护理套餐校验规则
export const carePackageSchema = z.object({
  name: z.string().trim().min(2, { message: '护理套餐名称至少2个字符' }).max(50, { message: '护理套餐名称最多50个字符' }),
  tasks: z.array(z.number()).min(1, { message: '请选择护理任务' }),
  minDuration: z.number().min(0, { message: '最小时长不能小于0' }),
  maxDuration: z.number().min(0, { message: '最大时长不能小于0' }),
  organizationId: z.number().min(1, { message: '请选择机构' }).optional(),
  status: z.number(),
  description: z.string().optional(),
}).refine((data) => {
  // 如果两个时长都提供了，验证 minDuration 不能超过 maxDuration
  if (data.minDuration !== undefined && data.maxDuration !== undefined) {
    return data.minDuration <= data.maxDuration;
  }
  return true;
}, {
  message: '最小时长不能超过最大时长',
  path: ['minDuration'], // 错误信息显示在 minDuration 字段上
})
export const personInfoSchema = z.object({
  name: z.string().trim().min(2, { message: '人员名称至少2个字符' }).max(50, { message: '人员名称最多50个字符' }),
  mobile: z.string().trim().min(11, { message: '请输入正确的手机号' }).max(11, { message: '请输入正确的手机号' }),
  credential: z.string()
    .trim()
    .min(1, { message: '请输入证件号' })
    .refine((value) => {
      const result = validateIdCard(value)
      return result.isValid
    }, { message: '请输入正确的身份证号码' }),
  avatar: z.number().min(1, { message: '请选择头像' }).optional(),
  organizationId: z.number().min(1, { message: '请选择机构' }),
  status: z.number(),
  description: z.string().optional(),
  type: z.string().min(1, { message: '请选择类型' }),
})
export const insuredSchema = z.object({
  ...personInfoSchema.shape,
  packageId: z.number().min(1, { message: '请选择套餐' }),
  address: z.string().trim().min(2, { message: '地址至少2个字符' }).max(50, { message: '地址最多50个字符' }),
  latitude: z.number().min(-90, { message: '纬度必须在-90到90之间' }).max(90, { message: '纬度必须在-90到90之间' }).optional(),
  longitude: z.number().min(-180, { message: '经度必须在-180到180之间' }).max(180, { message: '经度必须在-180到180之间' }).optional(),
})
export const schedulePlanSchema = z.object({
  month: z.string().trim().min(1, { message: '请选择月份' }),
  organizationId: z.number().min(1, { message: '请选择机构' }).optional(),
  nurseName: z.string().optional(),
  insuredName: z.string().optional(),
})
export const schedulePlanCreateSchema = z.object({
  organizationId: z.number().min(1, { message: '请选择机构' }),
  nurseId: z.number().min(1, { message: '请选择护士' }),
  insuredId: z.number().min(1, { message: '请选择被保险人' }),
  packageId: z.number().min(1, { message: '请选择护理套餐' }),
  startTime: z.string().trim().min(1, { message: '请选择开始时间' })
    .refine((value) => {
      const date = new Date(value)
      return !isNaN(date.getTime())
    }, { message: '开始时间格式不正确' }),
  endTime: z.string().trim().min(1, { message: '请选择结束时间' })
    .refine((value) => {
      const date = new Date(value)
      return !isNaN(date.getTime())
    }, { message: '结束时间格式不正确' }),
  duration: z.number().min(1, { message: '请选择时长' })
    .refine((value) => {
      return !isNaN(value) && value > 0
    }, { message: '时长必须是大于0的数字' }),
  description: z.string().optional().nullable(),
  status: z.number().optional().nullable(),
}).refine((data) => {
  // 验证开始时间不能晚于结束时间
  const startTime = new Date(data.startTime)
  const endTime = new Date(data.endTime)
  return startTime < endTime
}, {
  message: '开始时间不能晚于结束时间',
  path: ['startTime'],
}).refine((data) => {
  // 验证时长与时间范围的合理性
  const startTime = new Date(data.startTime)
  const endTime = new Date(data.endTime)
  const duration = data.duration
  const actualDuration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60)) // 分钟

  // 允许一定的误差范围（±5分钟）
  return Math.abs(actualDuration - duration) <= 5
}, {
  message: '时长与时间范围不匹配',
  path: ['duration'],
}).refine((data) => {
  // 验证开始时间必须晚于今天（只允许明天及以后）
  const startTime = new Date(data.startTime)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0) // 设置为明天的开始时间
  return startTime >= tomorrow
}, {
  message: '排班时间必须是明天及以后',
  path: ['startTime'],
})
// 文件上传校验规则
export const fileUploadSchema = z.object({
  name: z.string().trim().min(1, { message: '文件名不能为空' }).max(255, { message: '文件名过长' }),
  size: z.number().min(1, { message: '文件大小不能为0' }).max(10 * 1024 * 1024, { message: '文件大小不能超过10MB' }),
  type: z.string().min(1, { message: '文件类型不能为空' }),
})
export type LoginSchema = z.infer<typeof loginSchema>
export type PageSchema = z.infer<typeof pageSchema>
export type OrganizationSchema = z.infer<typeof organizationSchema>
export type RoleSchema = z.infer<typeof roleSchema>
export type MenuSchema = z.infer<typeof menuSchema>
export type PermissionSchema = z.infer<typeof permissionSchema>
export type CareTaskSchema = z.infer<typeof careTaskSchema>
export type PersonInfoSchema = z.infer<typeof personInfoSchema>
export type FileUploadSchema = z.infer<typeof fileUploadSchema>
export type CarePackageSchema = z.infer<typeof carePackageSchema>
export type InsuredSchema = z.infer<typeof insuredSchema>
export type SchedulePlanSchema = z.infer<typeof schedulePlanSchema>
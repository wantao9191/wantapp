import { z } from 'zod'
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
  status: z.number().optional(),
  description: z.string().optional(),
  coverId: z.number().min(1, { message: '请选择封面' }),
  audioId: z.number().min(1, { message: '请选择音频' }),
  minDuration: z.number().min(0, { message: '最小时长不能小于0' }).optional(),
  maxDuration: z.number().min(0, { message: '最大时长不能小于0' }).optional(),
  level: z.string().optional(),
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
export type FileUploadSchema = z.infer<typeof fileUploadSchema>
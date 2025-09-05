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
export type LoginSchema = z.infer<typeof loginSchema>
export type PageSchema = z.infer<typeof pageSchema>
export type OrganizationSchema = z.infer<typeof organizationSchema>
export type RoleSchema = z.infer<typeof roleSchema>
export type MenuSchema = z.infer<typeof menuSchema>
export type PermissionSchema = z.infer<typeof permissionSchema>
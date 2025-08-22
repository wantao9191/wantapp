import { z } from 'zod'
export const loginSchema = z.object({
  username: z.string().trim().min(1, { message: '请输入用户名' }),
  password: z.string().trim().min(1, { message: '请输入密码' }),
  code: z.string().trim().length(4, { message: '验证码为4位' }),
})
export const pageSchema = z.object({
  page: z.number().min(1, { message: '页码不能小于1' }),
  pageSize: z.number().min(1, { message: '每页条数不能小于1' }),
})
export const organizationSchema = z.object({
  name: z.string().trim().min(1, { message: '请输入机构名称' }),
  status: z.number().optional(),
  address: z.string().optional(),
  phone: z.string().min(11, { message: '请输入正确的手机号' }).max(11, { message: '请输入正确的手机号' }).optional(),
  email: z.string().email().optional(),
  operator: z.string().optional(),
  setupTime: z.string().optional(),
  description: z.string().optional(),
})

export const roleSchema = z.object({
  name: z.string().trim().min(1, { message: '请输入角色名称' }),
  status: z.number().optional(),
  description: z.string().optional(),
})

export type LoginSchema = z.infer<typeof loginSchema>
export type PageSchema = z.infer<typeof pageSchema>
export type OrganizationSchema = z.infer<typeof organizationSchema>
export type RoleSchema = z.infer<typeof roleSchema>
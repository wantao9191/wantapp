import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  pageSchema,
  organizationSchema,
  roleSchema,
  menuSchema,
  permissionSchema,
  userSchema
} from '../../src/lib/validations'

describe('validations', () => {
  describe('loginSchema', () => {
    it('应该验证有效的登录数据', () => {
      const validData = {
        username: 'testuser',
        password: 'password123',
        code: '1234'
      }
      
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('应该拒绝无效的用户名', () => {
      const invalidData = {
        username: '1invalid', // 不能以数字开头
        password: 'password123',
        code: '1234'
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('应该拒绝过短的用户名', () => {
      const invalidData = {
        username: 'ab', // 少于3个字符
        password: 'password123',
        code: '1234'
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('应该拒绝空密码', () => {
      const invalidData = {
        username: 'testuser',
        password: '',
        code: '1234'
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的验证码长度', () => {
      const invalidData = {
        username: 'testuser',
        password: 'password123',
        code: '123' // 不是4位
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('pageSchema', () => {
    it('应该验证有效的分页数据', () => {
      const validData = {
        page: 1,
        pageSize: 10
      }
      
      const result = pageSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('应该拒绝无效的页码', () => {
      const invalidData = {
        page: 0, // 不能小于1
        pageSize: 10
      }
      
      const result = pageSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的页面大小', () => {
      const invalidData = {
        page: 1,
        pageSize: 0 // 不能小于1
      }
      
      const result = pageSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('organizationSchema', () => {
    it('应该验证有效的组织数据', () => {
      const validData = {
        name: '测试组织',
        status: 1,
        address: '测试地址',
        phone: '13800138000',
        email: 'test@example.com'
      }
      
      const result = organizationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('应该拒绝过短的组织名称', () => {
      const invalidData = {
        name: '测' // 少于2个字符
      }
      
      const result = organizationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的邮箱', () => {
      const invalidData = {
        name: '测试组织',
        email: 'invalid-email'
      }
      
      const result = organizationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('roleSchema', () => {
    it('应该验证有效的角色数据', () => {
      const validData = {
        name: '管理员',
        status: 1,
        description: '系统管理员角色',
        menus: [1, 2, 3],
        permissions: [1, 2, 3]
      }
      
      const result = roleSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('应该拒绝过短的角色名称', () => {
      const invalidData = {
        name: '管' // 少于2个字符
      }
      
      const result = roleSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('menuSchema', () => {
    it('应该验证有效的菜单数据', () => {
      const validData = {
        name: '用户管理',
        status: 1,
        description: '用户管理菜单',
        parentId: 1,
        path: '/admin/users',
        icon: 'user',
        sort: 1
      }
      
      const result = menuSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('应该拒绝过短的菜单名称', () => {
      const invalidData = {
        name: '用' // 少于2个字符
      }
      
      const result = menuSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('permissionSchema', () => {
    it('应该验证有效的权限数据', () => {
      const validData = {
        name: '用户查看',
        status: 1,
        code: 'user_view',
        menuId: 1,
        description: '查看用户权限'
      }
      
      const result = permissionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('应该拒绝空的权限编码', () => {
      const invalidData = {
        name: '用户查看',
        code: '', // 不能为空
        menuId: 1
      }
      
      const result = permissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的菜单ID', () => {
      const invalidData = {
        name: '用户查看',
        code: 'user_view',
        menuId: 0 // 不能小于1
      }
      
      const result = permissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('userSchema', () => {
    it('应该验证有效的用户数据', () => {
      const validData = {
        name: '张三',
        username: 'zhangsan',
        phone: '13800138000',
        status: 1,
        email: 'zhangsan@example.com',
        roles: [1, 2],
        organizationId: 1
      }
      
      const result = userSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('应该拒绝无效的用户名格式', () => {
      const invalidData = {
        name: '张三',
        username: '1invalid', // 不能以数字开头
        phone: '13800138000'
      }
      
      const result = userSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的手机号', () => {
      const invalidData = {
        name: '张三',
        username: 'zhangsan',
        phone: '1380013800' // 不是11位
      }
      
      const result = userSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('应该拒绝无效的邮箱格式', () => {
      const invalidData = {
        name: '张三',
        username: 'zhangsan',
        phone: '13800138000',
        email: 'invalid-email'
      }
      
      const result = userSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
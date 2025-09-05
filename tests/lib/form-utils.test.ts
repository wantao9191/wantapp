import { describe, it, expect } from 'vitest'
import { FormConfigBuilder, createFormConfig, createQuickForm, FormRules } from '../../src/lib/form-utils'

describe('form-utils', () => {
  describe('FormConfigBuilder', () => {
    it('应该创建空的表单配置构建器', () => {
      const builder = new FormConfigBuilder()
      const config = builder.build()
      
      expect(config.items).toEqual([])
    })

    it('应该设置表单布局', () => {
      const builder = new FormConfigBuilder()
      const config = builder.layout('horizontal').build()
      
      expect(config.layout).toBe('horizontal')
    })

    it('应该设置表单尺寸', () => {
      const builder = new FormConfigBuilder()
      const config = builder.size('large').build()
      
      expect(config.size).toBe('large')
    })

    it('应该设置标签列配置', () => {
      const builder = new FormConfigBuilder()
      const config = builder.labelCol(6, 2).build()
      
      expect(config.labelCol).toEqual({ span: 6, offset: 2 })
    })

    it('应该设置包装列配置', () => {
      const builder = new FormConfigBuilder()
      const config = builder.wrapperCol(18, 0).build()
      
      expect(config.wrapperCol).toEqual({ span: 18, offset: 0 })
    })

    it('应该添加表单项', () => {
      const builder = new FormConfigBuilder()
      const config = builder
        .addItem('input', 'username', '用户名', { placeholder: '请输入用户名' })
        .build()
      
      expect(config.items).toHaveLength(1)
      expect(config.items[0]).toEqual({
        name: 'username',
        label: '用户名',
        type: 'input',
        placeholder: '请输入用户名'
      })
    })

    it('应该批量添加表单项', () => {
      const builder = new FormConfigBuilder()
      const items = [
        { type: 'input' as const, name: 'username', label: '用户名' },
        { type: 'password' as const, name: 'password', label: '密码' }
      ]
      const config = builder.addItems(items).build()
      
      expect(config.items).toHaveLength(2)
      expect(config.items[0].name).toBe('username')
      expect(config.items[1].name).toBe('password')
    })

    it('应该重置构建器', () => {
      const builder = new FormConfigBuilder()
      builder
        .layout('horizontal')
        .addItem('input', 'test', '测试')
        .reset()
      
      const config = builder.build()
      expect(config.layout).toBeUndefined()
      expect(config.items).toEqual([])
    })

    it('应该支持链式调用', () => {
      const builder = new FormConfigBuilder()
      const config = builder
        .layout('vertical')
        .size('middle')
        .labelCol(8)
        .wrapperCol(16)
        .addItem('input', 'name', '姓名')
        .addItem('email', 'email', '邮箱')
        .build()
      
      expect(config.layout).toBe('vertical')
      expect(config.size).toBe('middle')
      expect(config.labelCol).toEqual({ span: 8, offset: undefined })
      expect(config.wrapperCol).toEqual({ span: 16, offset: undefined })
      expect(config.items).toHaveLength(2)
    })
  })

  describe('createFormConfig', () => {
    it('应该创建表单配置构建器实例', () => {
      const builder = createFormConfig()
      expect(builder).toBeInstanceOf(FormConfigBuilder)
    })
  })

  describe('createQuickForm', () => {
    it('应该快速创建表单配置', () => {
      const config = createQuickForm({
        layout: 'horizontal',
        size: 'large',
        items: [
          { name: 'username', label: '用户名', type: 'input' },
          { name: 'password', label: '密码', type: 'password' }
        ]
      })
      
      expect(config.layout).toBe('horizontal')
      expect(config.size).toBe('large')
      expect(config.items).toHaveLength(2)
    })

    it('应该处理可选配置', () => {
      const config = createQuickForm({
        items: [
          { name: 'test', label: '测试', type: 'input' }
        ]
      })
      
      expect(config.layout).toBeUndefined()
      expect(config.size).toBeUndefined()
      expect(config.items).toHaveLength(1)
    })
  })

  describe('FormRules', () => {
    it('应该创建必填验证规则', () => {
      const rule = FormRules.required('此字段必填')
      expect(rule).toEqual({ required: true, message: '此字段必填' })
    })

    it('应该创建邮箱验证规则', () => {
      const rule = FormRules.email()
      expect(rule).toEqual({ type: 'email', message: '请输入正确的邮箱地址' })
    })

    it('应该创建URL验证规则', () => {
      const rule = FormRules.url('请输入有效URL')
      expect(rule).toEqual({ type: 'url', message: '请输入有效URL' })
    })

    it('应该创建最小长度验证规则', () => {
      const rule = FormRules.min(6)
      expect(rule).toEqual({ min: 6, message: '最少输入6个字符' })
    })

    it('应该创建最大长度验证规则', () => {
      const rule = FormRules.max(20, '不能超过20个字符')
      expect(rule).toEqual({ max: 20, message: '不能超过20个字符' })
    })

    it('应该创建固定长度验证规则', () => {
      const rule = FormRules.len(11)
      expect(rule).toEqual({ len: 11, message: '请输入11个字符' })
    })

    it('应该创建正则验证规则', () => {
      const pattern = /^[a-zA-Z]+$/
      const rule = FormRules.pattern(pattern, '只能输入字母')
      expect(rule).toEqual({ pattern, message: '只能输入字母' })
    })

    it('应该创建手机号验证规则', () => {
      const rule = FormRules.phone()
      expect(rule.pattern).toEqual(/^1[3-9]\d{9}$/)
      expect(rule.message).toBe('请输入正确的手机号码')
    })

    it('应该创建身份证验证规则', () => {
      const rule = FormRules.idCard()
      expect(rule.pattern).toEqual(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/)
      expect(rule.message).toBe('请输入正确的身份证号码')
    })

    it('应该创建数字验证规则', () => {
      const rule = FormRules.number()
      expect(rule).toEqual({ type: 'number', message: '请输入数字' })
    })

    it('应该创建整数验证规则', () => {
      const rule = FormRules.integer()
      expect(rule).toEqual({ type: 'integer', message: '请输入整数' })
    })

    it('应该创建空格验证规则', () => {
      const rule = FormRules.whitespace()
      expect(rule).toEqual({ whitespace: true, message: '不能只输入空格' })
    })

    it('应该创建自定义验证规则', () => {
      const validator = async () => {}
      const rule = FormRules.custom(validator)
      expect(rule.validator).toBe(validator)
    })
  })
})
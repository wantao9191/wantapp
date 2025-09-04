import type { FormItemConfig, FormConfig, FormItemType } from '@/types/form-config'

/**
 * 表单配置工具函数
 */
export class FormConfigBuilder {
  private items: FormItemConfig[] = []
  private formConfig: Partial<FormConfig> = {}

  /**
   * 设置表单布局
   */
  layout(layout: 'horizontal' | 'vertical' | 'inline') {
    this.formConfig.layout = layout
    return this
  }

  /**
   * 设置表单尺寸
   */
  size(size: 'small' | 'middle' | 'large') {
    this.formConfig.size = size
    return this
  }

  /**
   * 设置标签列配置
   */
  labelCol(span?: number, offset?: number) {
    this.formConfig.labelCol = { span, offset }
    return this
  }

  /**
   * 设置包装列配置
   */
  wrapperCol(span?: number, offset?: number) {
    this.formConfig.wrapperCol = { span, offset }
    return this
  }

  /**
   * 通用添加表单项方法
   */
  addItem(type: FormItemType, name: string | string[], label: string, extraProps: any = {}, options: Partial<FormItemConfig> = {}) {
    this.items.push({
      name,
      label,
      type,
      ...extraProps,
      ...options
    } as FormItemConfig)
    return this
  }
  
  /**
   * 批量添加表单项
   */
  addItems(items: Array<{
    type: FormItemType
    name: string | string[]
    label: string
    [key: string]: any
  }>) {
    items.forEach(({ type, name, label, ...rest }) => {
      this.addItem(type, name, label, rest)
    })
    return this
  }

  /**
   * 构建表单配置
   */
  build(): FormConfig {
    return {
      ...this.formConfig,
      items: this.items
    }
  }

  /**
   * 重置构建器
   */
  reset() {
    this.items = []
    this.formConfig = {}
    return this
  }
}

/**
 * 创建表单配置构建器
 */
export const createFormConfig = () => new FormConfigBuilder()

/**
 * 快速创建表单配置的工厂函数
 */
export const createQuickForm = (config: {
  layout?: 'horizontal' | 'vertical' | 'inline'
  size?: 'small' | 'middle' | 'large'
  items: FormItemConfig[]
}) => {
  const builder = createFormConfig()

  if (config.layout) builder.layout(config.layout)
  if (config.size) builder.size(config.size)

  return builder.addItems(config.items).build()
}

/**
 * 表单验证规则工具
 */
export const FormRules = {
  required: (message?: string) => ({ required: true, message }),
  email: (message = '请输入正确的邮箱地址') => ({ type: 'email' as const, message }),
  url: (message = '请输入正确的URL地址') => ({ type: 'url' as const, message }),
  min: (min: number, message?: string) => ({ min, message: message || `最少输入${min}个字符` }),
  max: (max: number, message?: string) => ({ max, message: message || `最多输入${max}个字符` }),
  len: (len: number, message?: string) => ({ len, message: message || `请输入${len}个字符` }),
  pattern: (pattern: RegExp, message: string) => ({ pattern, message }),
  phone: (message = '请输入正确的手机号码') => ({
    pattern: /^1[3-9]\d{9}$/,
    message
  }),
  idCard: (message = '请输入正确的身份证号码') => ({
    pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    message
  }),
  number: (message = '请输入数字') => ({ type: 'number' as const, message }),
  integer: (message = '请输入整数') => ({ type: 'integer' as const, message }),
  whitespace: (message = '不能只输入空格') => ({ whitespace: true, message }),
  custom: (validator: (rule: any, value: any) => Promise<void>) => ({ validator })
}


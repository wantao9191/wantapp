'use client'

import React from 'react'
import { Input } from 'antd'
import type { FormItemConfig, FormContext } from '@/types/form-config'
import {
  InputItem,
  NumberItem,
  SelectItem,
  RadioItem,
  CheckboxItem,
  SwitchItem,
  DateItem,
  UploadItem,
  CascaderItem,
  TreeSelectItem,
  RateItem,
  SliderItem,
  ColorPickerItem,
  CustomItem,
  ApiSelectItem
} from './Items'

interface FormItemRendererProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  formContext?: FormContext
}

// 表单项组件映射
const FormItems = {
  // 输入类型
  input: InputItem,
  textarea: InputItem,
  password: InputItem,

  // 数字类型
  number: NumberItem,

  // 选择类型
  select: SelectItem,
  multiSelect: SelectItem,

  // 单选/多选
  radio: RadioItem,
  checkbox: CheckboxItem,

  // 开关
  switch: SwitchItem,

  // 日期时间
  date: DateItem,
  dateRange: DateItem,
  time: DateItem,

  // 上传
  upload: UploadItem,

  // 级联/树选择
  cascader: CascaderItem,
  treeSelect: TreeSelectItem,

  // 其他组件
  rate: RateItem,
  slider: SliderItem,
  colorPicker: ColorPickerItem,
  custom: CustomItem,
  apiSelect: ApiSelectItem
}

const FormItemRenderer: React.FC<FormItemRendererProps> = ({
  config,
  value,
  onChange,
  disabled,
  formContext
}) => {
  // 获取对应的表单项组件
  const ItemComponent = FormItems[config.type as keyof typeof FormItems]

  // 如果找到对应的组件，使用它；否则使用默认的 Input
  if (ItemComponent) {
    return (
      <ItemComponent
        config={config as any}
        value={value}
        onChange={onChange}
        disabled={disabled}
        formContext={formContext}
      />
    )
  }

  // 解析函数参数
  const resolvedPlaceholder = formContext && typeof config.placeholder === 'function' 
    ? config.placeholder(formContext) 
    : config.placeholder
  const resolvedDisabled = formContext && typeof config.disabled === 'function' 
    ? config.disabled(formContext) 
    : config.disabled
  const resolvedStyle = formContext && typeof config.style === 'function' 
    ? config.style(formContext) 
    : config.style
  const resolvedClassName = formContext && typeof config.className === 'function' 
    ? config.className(formContext) 
    : config.className

  // 默认回退到普通输入框
  return (
    <Input
      placeholder={resolvedPlaceholder as string}
      disabled={disabled || (resolvedDisabled as boolean)}
      style={resolvedStyle as React.CSSProperties}
      className={resolvedClassName as string}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}

export default FormItemRenderer
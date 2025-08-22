'use client'

import React from 'react'
import { Input } from 'antd'
import type { FormItemConfig } from '@/types/form-config'
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
  CustomItem
} from './items'

interface FormItemRendererProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
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
  custom: CustomItem
}

const FormItemRenderer: React.FC<FormItemRendererProps> = ({
  config,
  value,
  onChange,
  disabled
}) => {
  // 获取对应的表单项组件
  const ItemComponent = FormItems[config.type as keyof typeof FormItems]

  // 如果找到对应的组件，使用它；否则使用默认的 Input
  if (ItemComponent) {
    return (
      <ItemComponent
        config={config}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    )
  }

  // 默认回退到普通输入框
  return (
    <Input
      placeholder={config.placeholder}
      disabled={disabled || config.disabled}
      style={config.style}
      className={config.className}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}

export default FormItemRenderer
'use client'

import React, { useMemo, useCallback } from 'react'
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
  // 获取对应的表单项组件 - 使用 useMemo 缓存
  const ItemComponent = useMemo(() => {
    return FormItems[config.type as keyof typeof FormItems]
  }, [config.type])

  // 使用 useCallback 优化 onChange 处理函数
  const handleChange = useCallback((e: any) => {
    onChange?.(e.target.value)
  }, [onChange])

  // 解析函数参数 - 使用 useMemo 缓存计算结果
  const resolvedPlaceholder = useMemo(() => {
    return formContext && typeof config.placeholder === 'function' 
      ? config.placeholder(formContext) 
      : config.placeholder
  }, [config.placeholder, formContext])

  const resolvedDisabled = useMemo(() => {
    return formContext && typeof config.disabled === 'function' 
      ? config.disabled(formContext) 
      : config.disabled
  }, [config.disabled, formContext])

  const resolvedStyle = useMemo(() => {
    return formContext && typeof config.style === 'function' 
      ? config.style(formContext) 
      : config.style
  }, [config.style, formContext])

  const resolvedClassName = useMemo(() => {
    return formContext && typeof config.className === 'function' 
      ? config.className(formContext) 
      : config.className
  }, [config.className, formContext])

  // 使用 useMemo 缓存 inputProps 对象
  const inputProps = useMemo(() => ({
    placeholder: resolvedPlaceholder as string,
    disabled: disabled || (resolvedDisabled as boolean),
    style: resolvedStyle as React.CSSProperties,
    className: resolvedClassName as string,
    value,
    onChange: handleChange
  }), [
    resolvedPlaceholder,
    disabled,
    resolvedDisabled,
    resolvedStyle,
    resolvedClassName,
    value,
    handleChange
  ])

  // 如果找到对应的组件，使用它；否则使用默认的 Input
  if (ItemComponent) {
    return (
      <ItemComponent
        config={config as any}
        disabled={disabled}
        formContext={formContext}
        value={value}
        onChange={onChange}
      />
    )
  }

  // 默认回退到普通输入框
  return <Input {...inputProps} />
}

// 使用 React.memo 包装组件，避免不必要的重新渲染
export default React.memo(FormItemRenderer, (prevProps, nextProps) => {
  // 自定义比较函数，只在关键属性变化时重新渲染
  return (
    prevProps.value === nextProps.value &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.config === nextProps.config &&
    prevProps.formContext === nextProps.formContext
  )
})
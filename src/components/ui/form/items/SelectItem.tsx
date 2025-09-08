'use client'

import React, { useMemo, useCallback } from 'react'
import { Select } from 'antd'
import type { FormItemConfig, FormContext } from '@/types/form-config'

const { Option } = Select

interface SelectItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  formContext?: FormContext
}

const SelectItem: React.FC<SelectItemProps> = ({ config, value, onChange, disabled, formContext }) => {
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

  const selectConfig = useMemo(() => config as any, [config])

  // 使用 useMemo 缓存选项列表
  const options = useMemo(() => {
    return selectConfig.options?.map((option: any) => (
      <Option key={option.value} value={option.value} disabled={option.disabled}>
        {option.label}
      </Option>
    )) || []
  }, [selectConfig.options])

  // 使用 useMemo 缓存静态属性对象（不包含 value 和 onChange）
  const staticProps = useMemo(() => ({
    placeholder: resolvedPlaceholder as string,
    disabled: disabled || (resolvedDisabled as boolean),
    style: resolvedStyle as React.CSSProperties,
    className: resolvedClassName as string,
    mode: config.type === 'multiSelect' ? (selectConfig.mode || 'multiple') : undefined,
    allowClear: selectConfig.allowClear,
    showSearch: selectConfig.showSearch,
    filterOption: selectConfig.filterOption,
    maxTagCount: selectConfig.maxTagCount,
    loading: selectConfig.loading,
    onSearch: selectConfig.onSearch,
    onFocus: selectConfig.onFocus,
    onBlur: selectConfig.onBlur,
    size: selectConfig.size
  }), [
    resolvedPlaceholder,
    disabled,
    resolvedDisabled,
    resolvedStyle,
    resolvedClassName,
    config.type,
    selectConfig.mode,
    selectConfig.allowClear,
    selectConfig.showSearch,
    selectConfig.filterOption,
    selectConfig.maxTagCount,
    selectConfig.loading,
    selectConfig.onSearch,
    selectConfig.onFocus,
    selectConfig.onBlur,
    selectConfig.size
  ])

  return (
    <Select {...staticProps} value={value} onChange={onChange}>
      {options}
    </Select>
  )
}

// 使用 React.memo 包装组件，避免不必要的重新渲染
export default React.memo(SelectItem, (prevProps, nextProps) => {
  // 自定义比较函数，只在关键属性变化时重新渲染
  // 注意：value 变化时允许重新渲染，因为这是正常的选择行为
  return (
    prevProps.disabled === nextProps.disabled &&
    prevProps.config === nextProps.config &&
    prevProps.formContext === nextProps.formContext &&
    prevProps.onChange === nextProps.onChange
  )
})
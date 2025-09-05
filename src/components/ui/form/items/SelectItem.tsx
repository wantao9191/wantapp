'use client'

import React from 'react'
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

  const selectConfig = config as any
  return (
    <Select
      placeholder={resolvedPlaceholder as string}
      disabled={disabled || (resolvedDisabled as boolean)}
      style={resolvedStyle as React.CSSProperties}
      className={resolvedClassName as string}
      mode={config.type === 'multiSelect' ? (selectConfig.mode || 'multiple') : undefined}
      allowClear={selectConfig.allowClear}
      showSearch={selectConfig.showSearch}
      filterOption={selectConfig.filterOption}
      maxTagCount={selectConfig.maxTagCount}
      loading={selectConfig.loading}
      onSearch={selectConfig.onSearch}
      onFocus={selectConfig.onFocus}
      onBlur={selectConfig.onBlur}
      value={value}
      onChange={onChange}
      size={selectConfig.size}
    >
      {selectConfig.options?.map((option: any) => (
        <Option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </Option>
      ))}
    </Select>
  )
}

export default SelectItem
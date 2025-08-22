'use client'

import React from 'react'
import { Select } from 'antd'
import type { FormItemConfig } from '@/types/form-config'

const { Option } = Select

interface SelectItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
}

const SelectItem: React.FC<SelectItemProps> = ({ config, value, onChange, disabled }) => {
  const selectConfig = config as any
  return (
    <Select
      placeholder={config.placeholder}
      disabled={disabled || config.disabled}
      style={config.style}
      className={config.className}
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
'use client'

import React from 'react'
import { Checkbox } from 'antd'
import type { FormItemConfig } from '@/types/form-config'

const { Group: CheckboxGroup } = Checkbox

interface CheckboxItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({ config, value, onChange, disabled }) => {
  const checkboxConfig = config as any

  if (checkboxConfig.options) {
    return (
      <CheckboxGroup
        disabled={disabled || config.disabled}
        style={config.style}
        className={config.className}
        options={checkboxConfig.options}
        value={value}
        onChange={onChange}
      />
    )
  } else {
    return (
      <Checkbox
        disabled={disabled || config.disabled}
        style={config.style}
        className={config.className}
        indeterminate={checkboxConfig.indeterminate}
        checked={value}
        onChange={(e) => onChange?.(e.target.checked)}
      >
        {config.label}
      </Checkbox>
    )
  }
}

export default CheckboxItem
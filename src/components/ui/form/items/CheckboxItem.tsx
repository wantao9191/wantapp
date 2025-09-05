'use client'

import React from 'react'
import { Checkbox } from 'antd'
import type { FormItemConfig, FormContext } from '@/types/form-config'

const { Group: CheckboxGroup } = Checkbox

interface CheckboxItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  formContext?: FormContext
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({ config, value, onChange, disabled, formContext }) => {
  // 解析函数参数
  const resolvedDisabled = formContext && typeof config.disabled === 'function' 
    ? (config.disabled as any)(formContext) 
    : config.disabled
  const resolvedStyle = formContext && typeof config.style === 'function' 
    ? (config.style as any)(formContext) 
    : config.style
  const resolvedClassName = formContext && typeof config.className === 'function' 
    ? (config.className as any)(formContext) 
    : config.className

  const checkboxConfig = config as any

  if (checkboxConfig.options) {
    return (
      <CheckboxGroup
        disabled={disabled || (resolvedDisabled as boolean)}
        style={resolvedStyle as React.CSSProperties}
        className={resolvedClassName as string}
        options={checkboxConfig.options}
        value={value}
        onChange={onChange}
      />
    )
  } else {
    return (
      <Checkbox
        disabled={disabled || (resolvedDisabled as boolean)}
        style={resolvedStyle as React.CSSProperties}
        className={resolvedClassName as string}
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
'use client'

import React from 'react'
import { Radio } from 'antd'
import type { FormItemConfig, FormContext } from '@/types/form-config'

const { Group: RadioGroup } = Radio

interface RadioItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  formContext?: FormContext
}

const RadioItem: React.FC<RadioItemProps> = ({ config, value, onChange, disabled, formContext }) => {
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

  const radioConfig = config as any

  return (
    <RadioGroup
      buttonStyle={radioConfig.buttonStyle}
      className={resolvedClassName as string}
      disabled={disabled || (resolvedDisabled as boolean)}
      optionType={radioConfig.optionType}
      size={radioConfig.size}
      style={resolvedStyle as React.CSSProperties}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {radioConfig.options?.map((option: any) => (
        <Radio key={option.value} disabled={option.disabled} value={option.value}>
          {option.label}
        </Radio>
      ))}
    </RadioGroup>
  )
}

export default RadioItem
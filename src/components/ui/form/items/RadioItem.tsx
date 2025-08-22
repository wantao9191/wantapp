'use client'

import React from 'react'
import { Radio } from 'antd'
import type { FormItemConfig } from '@/types/form-config'

const { Group: RadioGroup } = Radio

interface RadioItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
}

const RadioItem: React.FC<RadioItemProps> = ({ config, value, onChange, disabled }) => {
  const radioConfig = config as any

  return (
    <RadioGroup
      disabled={disabled || config.disabled}
      style={config.style}
      className={config.className}
      optionType={radioConfig.optionType}
      buttonStyle={radioConfig.buttonStyle}
      size={radioConfig.size}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {radioConfig.options?.map((option: any) => (
        <Radio key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </Radio>
      ))}
    </RadioGroup>
  )
}

export default RadioItem
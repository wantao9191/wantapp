'use client'

import React from 'react'
import { Input } from 'antd'
import type { FormItemConfig } from '@/types/form-config'

const { TextArea, Password } = Input

interface InputItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
}

const InputItem: React.FC<InputItemProps> = ({ config, value, onChange, disabled }) => {
  const commonProps = {
    placeholder: config.placeholder,
    disabled: disabled || config.disabled,
    style: config.style,
    className: config.className,
    value,
    onChange: (e: any) => onChange?.(e.target.value)
  }

  const inputConfig = config as any

  switch (config.type) {
    case 'textarea':
      return (
        <TextArea
          {...commonProps}
          rows={inputConfig.rows || 4}
          maxLength={inputConfig.maxLength}
          showCount={inputConfig.showCount}
          allowClear={inputConfig.allowClear}
          size={inputConfig.size}
        />
      )
    
    case 'password':
      return (
        <Password
          {...commonProps}
          maxLength={inputConfig.maxLength}
          showCount={inputConfig.showCount}
          allowClear={inputConfig.allowClear}
          prefix={inputConfig.prefix}
          suffix={inputConfig.suffix}
          addonBefore={inputConfig.addonBefore}
          addonAfter={inputConfig.addonAfter}
          size={inputConfig.size}
        />
      )
    
    default: // input
      return (
        <Input
          {...commonProps}
          maxLength={inputConfig.maxLength}
          showCount={inputConfig.showCount}
          allowClear={inputConfig.allowClear}
          prefix={inputConfig.prefix}
          suffix={inputConfig.suffix}
          addonBefore={inputConfig.addonBefore}
          addonAfter={inputConfig.addonAfter}
          size={inputConfig.size}
        />
      )
  }
}

export default InputItem
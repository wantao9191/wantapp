'use client'

import React from 'react'
import { Input } from 'antd'
import type { FormItemConfig, FormContext } from '@/types/form-config'

const { TextArea, Password } = Input

interface InputItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  formContext?: FormContext
}

const InputItem: React.FC<InputItemProps> = ({ config, value, onChange, disabled, formContext }) => {
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

  const commonProps = {
    placeholder: resolvedPlaceholder as string,
    disabled: disabled || (resolvedDisabled as boolean),
    style: resolvedStyle as React.CSSProperties,
    className: resolvedClassName as string,
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
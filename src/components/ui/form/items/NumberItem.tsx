'use client'

import React from 'react'
import { InputNumber } from 'antd'
import type { FormItemConfig, FormContext } from '@/types/form-config'

interface NumberItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  formContext?: FormContext
}

const NumberItem: React.FC<NumberItemProps> = ({ config, value, onChange, disabled, formContext }) => {
  // 解析函数参数
  const resolvedPlaceholder = formContext && typeof config.placeholder === 'function' 
    ? (config.placeholder as any)(formContext) 
    : config.placeholder
  const resolvedDisabled = formContext && typeof config.disabled === 'function' 
    ? (config.disabled as any)(formContext) 
    : config.disabled
  const resolvedStyle = formContext && typeof config.style === 'function' 
    ? (config.style as any)(formContext) 
    : config.style
  const resolvedClassName = formContext && typeof config.className === 'function' 
    ? (config.className as any)(formContext) 
    : config.className

  const numberConfig = config as any

  return (
    <InputNumber
      placeholder={resolvedPlaceholder as string}
      disabled={disabled || (resolvedDisabled as boolean)}
      style={{ width: '100%', ...(resolvedStyle as React.CSSProperties) }}
      className={resolvedClassName as string}
      min={numberConfig.min}
      max={numberConfig.max}
      step={numberConfig.step}
      precision={numberConfig.precision}
      formatter={numberConfig.formatter}
      parser={numberConfig.parser}
      addonBefore={numberConfig.addonBefore}
      addonAfter={numberConfig.addonAfter}
      value={value}
      onChange={onChange}
      size={numberConfig.size}
    />
  )
}

export default NumberItem
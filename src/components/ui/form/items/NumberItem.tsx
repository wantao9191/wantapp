'use client'

import React from 'react'
import { InputNumber } from 'antd'
import type { FormItemConfig } from '@/types/form-config'

interface NumberItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
}

const NumberItem: React.FC<NumberItemProps> = ({ config, value, onChange, disabled }) => {
  const numberConfig = config as any

  return (
    <InputNumber
      placeholder={config.placeholder}
      disabled={disabled || config.disabled}
      style={{ width: '100%', ...config.style }}
      className={config.className}
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
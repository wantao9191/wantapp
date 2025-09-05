'use client'

import React from 'react'
import { Switch } from 'antd'
import type { FormItemConfig, FormContext } from '@/types/form-config'

interface SwitchItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  formContext?: FormContext
}

const SwitchItem: React.FC<SwitchItemProps> = ({ config, value, onChange, disabled, formContext }) => {
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

  const switchConfig = config as any

  return (
    <Switch
      disabled={disabled || (resolvedDisabled as boolean)}
      style={resolvedStyle as React.CSSProperties}
      className={resolvedClassName as string}
      checkedChildren={switchConfig.checkedChildren}
      unCheckedChildren={switchConfig.unCheckedChildren}
      size={switchConfig.size}
      checked={value}
      onChange={onChange}
    />
  )
}

export default SwitchItem
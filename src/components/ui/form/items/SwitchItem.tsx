'use client'

import React from 'react'
import { Switch } from 'antd'
import type { FormItemConfig } from '@/types/form-config'

interface SwitchItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
}

const SwitchItem: React.FC<SwitchItemProps> = ({ config, value, onChange, disabled }) => {
  const switchConfig = config as any

  return (
    <Switch
      disabled={disabled || config.disabled}
      style={config.style}
      className={config.className}
      checkedChildren={switchConfig.checkedChildren}
      unCheckedChildren={switchConfig.unCheckedChildren}
      size={switchConfig.size}
      checked={value}
      onChange={onChange}
    />
  )
}

export default SwitchItem
'use client'

import React from 'react'
import { Cascader } from 'antd'
import type { FormItemConfig } from '@/types/form-config'

interface CascaderItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
}

const CascaderItem: React.FC<CascaderItemProps> = ({ config, value, onChange, disabled }) => {
  const cascaderConfig = config as any

  return (
    <Cascader
      placeholder={config.placeholder}
      disabled={disabled || config.disabled}
      style={{ width: '100%', ...config.style }}
      className={config.className}
      options={cascaderConfig.options}
      expandTrigger={cascaderConfig.expandTrigger}
      multiple={cascaderConfig.multiple}
      showSearch={cascaderConfig.showSearch}
      changeOnSelect={cascaderConfig.changeOnSelect}
      displayRender={cascaderConfig.displayRender}
      value={value}
      onChange={onChange}
      size={cascaderConfig.size}
    />
  )
}

export default CascaderItem
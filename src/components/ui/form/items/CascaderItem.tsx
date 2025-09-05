'use client'

import React from 'react'
import { Cascader } from 'antd'
import type { FormItemConfig, FormContext } from '@/types/form-config'

interface CascaderItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  formContext?: FormContext
}

const CascaderItem: React.FC<CascaderItemProps> = ({ config, value, onChange, disabled, formContext }) => {
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

  const cascaderConfig = config as any

  return (
    <Cascader
      placeholder={resolvedPlaceholder as string}
      disabled={disabled || (resolvedDisabled as boolean)}
      style={{ width: '100%', ...(resolvedStyle as React.CSSProperties) }}
      className={resolvedClassName as string}
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
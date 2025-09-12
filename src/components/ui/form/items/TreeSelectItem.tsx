'use client'

import React from 'react'
import { TreeSelect } from 'antd'
import type { FormItemConfig, FormContext } from '@/types/form-config'

interface TreeSelectItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  formContext?: FormContext
}

const TreeSelectItem: React.FC<TreeSelectItemProps> = ({ config, value, onChange, disabled, formContext }) => {
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

  const treeSelectConfig = config as any

  return (
    <TreeSelect
      allowClear={treeSelectConfig.allowClear}
      className={resolvedClassName as string}
      disabled={disabled || (resolvedDisabled as boolean)}
      multiple={treeSelectConfig.multiple}
      placeholder={resolvedPlaceholder as string}
      showCheckedStrategy={treeSelectConfig.showCheckedStrategy}
      size={treeSelectConfig.size}
      style={{ width: '100%', ...(resolvedStyle as React.CSSProperties) }}
      treeCheckable={treeSelectConfig.treeCheckable}
      treeData={treeSelectConfig.treeData}
      treeDefaultExpandAll={treeSelectConfig.treeDefaultExpandAll}
      value={value}
      onChange={onChange}
    />
  )
}

export default TreeSelectItem
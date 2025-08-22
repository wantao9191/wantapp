'use client'

import React from 'react'
import { TreeSelect } from 'antd'
import type { FormItemConfig } from '@/types/form-config'

interface TreeSelectItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
}

const TreeSelectItem: React.FC<TreeSelectItemProps> = ({ config, value, onChange, disabled }) => {
  const treeSelectConfig = config as any

  return (
    <TreeSelect
      placeholder={config.placeholder}
      disabled={disabled || config.disabled}
      style={{ width: '100%', ...config.style }}
      className={config.className}
      treeData={treeSelectConfig.treeData}
      multiple={treeSelectConfig.multiple}
      treeCheckable={treeSelectConfig.treeCheckable}
      showCheckedStrategy={treeSelectConfig.showCheckedStrategy}
      treeDefaultExpandAll={treeSelectConfig.treeDefaultExpandAll}
      allowClear={treeSelectConfig.allowClear}
      value={value}
      onChange={onChange}
      size={treeSelectConfig.size}
    />
  )
}

export default TreeSelectItem
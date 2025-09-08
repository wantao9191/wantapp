'use client'

import React, { useMemo } from 'react'
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
  // 解析函数参数 - 使用 useMemo 缓存计算结果
  const resolvedDisabled = useMemo(() => {
    return formContext && typeof config.disabled === 'function' 
      ? (config.disabled as any)(formContext) 
      : config.disabled
  }, [config.disabled, formContext])

  const resolvedStyle = useMemo(() => {
    return formContext && typeof config.style === 'function' 
      ? (config.style as any)(formContext) 
      : config.style
  }, [config.style, formContext])

  const resolvedClassName = useMemo(() => {
    return formContext && typeof config.className === 'function' 
      ? (config.className as any)(formContext) 
      : config.className
  }, [config.className, formContext])

  const switchConfig = useMemo(() => config as any, [config])

  // 使用 useMemo 缓存静态属性对象（不包含 checked 和 onChange）
  const staticProps = useMemo(() => ({
    disabled: disabled || (resolvedDisabled as boolean),
    style: resolvedStyle as React.CSSProperties,
    className: resolvedClassName as string,
    checkedChildren: switchConfig.checkedChildren,
    unCheckedChildren: switchConfig.unCheckedChildren,
    size: switchConfig.size
  }), [
    disabled,
    resolvedDisabled,
    resolvedStyle,
    resolvedClassName,
    switchConfig.checkedChildren,
    switchConfig.unCheckedChildren,
    switchConfig.size
  ])

  return <Switch {...staticProps} checked={value} onChange={onChange} />
}

// 使用 React.memo 包装组件，避免不必要的重新渲染
export default React.memo(SwitchItem, (prevProps, nextProps) => {
  // 自定义比较函数，只在关键属性变化时重新渲染
  // 注意：value 变化时允许重新渲染，因为这是正常的开关行为
  return (
    prevProps.disabled === nextProps.disabled &&
    prevProps.config === nextProps.config &&
    prevProps.formContext === nextProps.formContext &&
    prevProps.onChange === nextProps.onChange
  )
})
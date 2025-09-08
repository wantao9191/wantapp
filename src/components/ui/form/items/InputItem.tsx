'use client'

import React, { useMemo, useCallback } from 'react'
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
  // 解析函数参数 - 使用 useMemo 缓存计算结果
  const resolvedPlaceholder = useMemo(() => {
    return formContext && typeof config.placeholder === 'function' 
      ? config.placeholder(formContext) 
      : config.placeholder
  }, [config.placeholder, formContext])

  const resolvedDisabled = useMemo(() => {
    return formContext && typeof config.disabled === 'function' 
      ? config.disabled(formContext) 
      : config.disabled
  }, [config.disabled, formContext])

  const resolvedStyle = useMemo(() => {
    return formContext && typeof config.style === 'function' 
      ? config.style(formContext) 
      : config.style
  }, [config.style, formContext])

  const resolvedClassName = useMemo(() => {
    return formContext && typeof config.className === 'function' 
      ? config.className(formContext) 
      : config.className
  }, [config.className, formContext])

  // 使用 useCallback 优化 onChange 处理函数
  const handleChange = useCallback((e: any) => {
    onChange?.(e.target.value)
  }, [onChange])

  // 使用 useMemo 缓存静态属性对象（不包含 value 和 onChange）
  const staticProps = useMemo(() => ({
    placeholder: resolvedPlaceholder as string,
    disabled: disabled || (resolvedDisabled as boolean),
    style: resolvedStyle as React.CSSProperties,
    className: resolvedClassName as string
  }), [
    resolvedPlaceholder,
    disabled,
    resolvedDisabled,
    resolvedStyle,
    resolvedClassName
  ])

  const inputConfig = useMemo(() => config as any, [config])

  switch (config.type) {
    case 'textarea':
      return (
        <TextArea
          {...staticProps}
          value={value}
          onChange={handleChange}
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
          {...staticProps}
          value={value}
          onChange={handleChange}
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
          {...staticProps}
          value={value}
          onChange={handleChange}
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

// 使用 React.memo 包装组件，避免不必要的重新渲染
export default React.memo(InputItem, (prevProps, nextProps) => {
  // 自定义比较函数，只在关键属性变化时重新渲染
  // 注意：value 变化时允许重新渲染，因为这是正常的输入行为
  return (
    prevProps.disabled === nextProps.disabled &&
    prevProps.config === nextProps.config &&
    prevProps.formContext === nextProps.formContext &&
    prevProps.onChange === nextProps.onChange
  )
})
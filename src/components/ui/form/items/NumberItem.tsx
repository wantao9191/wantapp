'use client'

import React, { useMemo } from 'react'
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
  // 解析函数参数 - 使用 useMemo 缓存计算结果
  const resolvedPlaceholder = useMemo(() => {
    return formContext && typeof config.placeholder === 'function' 
      ? (config.placeholder as any)(formContext) 
      : config.placeholder
  }, [config.placeholder, formContext])

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

  const numberConfig = useMemo(() => config as any, [config])

  // 使用 useMemo 缓存静态属性对象（不包含 value 和 onChange）
  const staticProps = useMemo(() => ({
    placeholder: resolvedPlaceholder as string,
    disabled: disabled || (resolvedDisabled as boolean),
    style: { width: '100%', ...(resolvedStyle as React.CSSProperties) },
    className: resolvedClassName as string,
    min: numberConfig.min,
    max: numberConfig.max,
    step: numberConfig.step,
    precision: numberConfig.precision,
    formatter: numberConfig.formatter,
    parser: numberConfig.parser,
    addonBefore: numberConfig.addonBefore,
    addonAfter: numberConfig.addonAfter,
    size: numberConfig.size
  }), [
    resolvedPlaceholder,
    disabled,
    resolvedDisabled,
    resolvedStyle,
    resolvedClassName,
    numberConfig.min,
    numberConfig.max,
    numberConfig.step,
    numberConfig.precision,
    numberConfig.formatter,
    numberConfig.parser,
    numberConfig.addonBefore,
    numberConfig.addonAfter,
    numberConfig.size
  ])

  return <InputNumber {...staticProps} value={value} onChange={onChange} />
}

// 使用 React.memo 包装组件，避免不必要的重新渲染
export default React.memo(NumberItem, (prevProps, nextProps) => {
  // 自定义比较函数，只在关键属性变化时重新渲染
  // 注意：value 变化时允许重新渲染，因为这是正常的输入行为
  return (
    prevProps.disabled === nextProps.disabled &&
    prevProps.config === nextProps.config &&
    prevProps.formContext === nextProps.formContext &&
    prevProps.onChange === nextProps.onChange
  )
})
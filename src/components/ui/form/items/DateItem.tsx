'use client'

import React, { useMemo, useCallback } from 'react'
import { DatePicker, TimePicker } from 'antd'
import type { FormItemConfig, FormContext } from '@/types/form-config'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

interface DateItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  formContext?: FormContext
}

const DateItem: React.FC<DateItemProps> = ({ config, value, onChange, disabled, formContext }) => {
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

  const dateConfig = useMemo(() => config as any, [config])

  // 使用 useMemo 缓存 commonProps 对象
  const commonProps = useMemo(() => ({
    disabled: disabled || (resolvedDisabled as boolean),
    style: { width: '100%', ...(resolvedStyle as React.CSSProperties) },
    className: resolvedClassName as string,
    onChange
  }), [disabled, resolvedDisabled, resolvedStyle, resolvedClassName, onChange])

  // 使用 useMemo 缓存日期值处理
  const dateRangeValue = useMemo(() => {
    if (config.type === 'dateRange' && Array.isArray(value) && value.length === 2) {
      return [value[0] ? dayjs(value[0]) : null, value[1] ? dayjs(value[1]) : null] as [dayjs.Dayjs | null, dayjs.Dayjs | null]
    }
    return undefined
  }, [config.type, value])

  const singleDateValue = useMemo(() => {
    if (config.type !== 'dateRange' && value) {
      return dayjs(value)
    }
    return undefined
  }, [config.type, value])

  const dateRangePlaceholder = useMemo(() => {
    if (config.type === 'dateRange' && resolvedPlaceholder) {
      return [resolvedPlaceholder as string, resolvedPlaceholder as string] as [string, string]
    }
    return undefined
  }, [config.type, resolvedPlaceholder])

  switch (config.type) {
    case 'dateRange':
      return (
        <RangePicker
          {...commonProps}
          value={dateRangeValue}
          placeholder={dateRangePlaceholder}
          format={dateConfig.format}
          showTime={dateConfig.showTime}
          picker={dateConfig.picker}
          disabledDate={dateConfig.disabledDate}
          size={dateConfig.size}
        />
      )
    
    case 'time':
      return (
        <TimePicker
          {...commonProps}
          value={singleDateValue}
          placeholder={resolvedPlaceholder as string}
          format={dateConfig.format || 'HH:mm:ss'}
          size={dateConfig.size}
        />
      )
    
    default: // date
      return (
        <DatePicker
          {...commonProps}
          value={singleDateValue}
          placeholder={resolvedPlaceholder as string}
          format={dateConfig.format}
          showTime={dateConfig.showTime}
          picker={dateConfig.picker}
          disabledDate={dateConfig.disabledDate}
          showToday={dateConfig.showToday}
          size={dateConfig.size}
        />
      )
  }
}

// 使用 React.memo 包装组件，避免不必要的重新渲染
export default React.memo(DateItem, (prevProps, nextProps) => {
  // 自定义比较函数，只在关键属性变化时重新渲染
  return (
    prevProps.value === nextProps.value &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.config === nextProps.config &&
    prevProps.formContext === nextProps.formContext
  )
})
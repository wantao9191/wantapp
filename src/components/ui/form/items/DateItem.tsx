'use client'

import React from 'react'
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

  const dateConfig = config as any

  const commonProps = {
    disabled: disabled || (resolvedDisabled as boolean),
    style: { width: '100%', ...(resolvedStyle as React.CSSProperties) },
    className: resolvedClassName as string,
    onChange
  }

  switch (config.type) {
    case 'dateRange':
      return (
        <RangePicker
          {...commonProps}
          value={Array.isArray(value) && value.length === 2 
            ? [value[0] ? dayjs(value[0]) : null, value[1] ? dayjs(value[1]) : null] as [dayjs.Dayjs | null, dayjs.Dayjs | null]
            : undefined}
          placeholder={resolvedPlaceholder ? [resolvedPlaceholder as string, resolvedPlaceholder as string] : undefined}
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
          value={value ? dayjs(value) : undefined}
          placeholder={resolvedPlaceholder as string}
          format={dateConfig.format || 'HH:mm:ss'}
          size={dateConfig.size}
        />
      )
    
    default: // date
      return (
        <DatePicker
          {...commonProps}
          value={value ? dayjs(value) : undefined}
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

export default DateItem
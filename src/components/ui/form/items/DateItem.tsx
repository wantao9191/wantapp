'use client'

import React from 'react'
import { DatePicker, TimePicker } from 'antd'
import type { FormItemConfig } from '@/types/form-config'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

interface DateItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
}

const DateItem: React.FC<DateItemProps> = ({ config, value, onChange, disabled }) => {
  const dateConfig = config as any

  const commonProps = {
    disabled: disabled || config.disabled,
    style: { width: '100%', ...config.style },
    className: config.className,
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
          placeholder={dateConfig.placeholder ? [dateConfig.placeholder, dateConfig.placeholder] : undefined}
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
          placeholder={config.placeholder}
          format={dateConfig.format || 'HH:mm:ss'}
          size={dateConfig.size}
        />
      )
    
    default: // date
      return (
        <DatePicker
          {...commonProps}
          value={value ? dayjs(value) : undefined}
          placeholder={config.placeholder}
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
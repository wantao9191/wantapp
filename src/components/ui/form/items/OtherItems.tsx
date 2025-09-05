'use client'

import React from 'react'
import { Rate, Slider, ColorPicker } from 'antd'
import type { FormItemConfig, FormContext } from '@/types/form-config'

interface OtherItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  formContext?: FormContext
}

// 评分组件
export const RateItem: React.FC<OtherItemProps> = ({ config, value, onChange, disabled, formContext }) => {
  // 解析函数参数
  const resolvedDisabled = formContext && typeof config.disabled === 'function' 
    ? (config.disabled as any)(formContext) 
    : config.disabled
  const resolvedStyle = formContext && typeof config.style === 'function' 
    ? (config.style as any)(formContext) 
    : config.style
  const resolvedClassName = formContext && typeof config.className === 'function' 
    ? (config.className as any)(formContext) 
    : config.className

  const rateConfig = config as any

  return (
    <Rate
      disabled={disabled || (resolvedDisabled as boolean)}
      style={resolvedStyle as React.CSSProperties}
      className={resolvedClassName as string}
      count={rateConfig.count}
      allowHalf={rateConfig.allowHalf}
      allowClear={rateConfig.allowClear}
      character={rateConfig.character}
      tooltips={rateConfig.tooltips}
      value={value}
      onChange={onChange}
    />
  )
}

// 滑动输入条组件
export const SliderItem: React.FC<OtherItemProps> = ({ config, value, onChange, disabled, formContext }) => {
  // 解析函数参数
  const resolvedDisabled = formContext && typeof config.disabled === 'function' 
    ? (config.disabled as any)(formContext) 
    : config.disabled
  const resolvedStyle = formContext && typeof config.style === 'function' 
    ? (config.style as any)(formContext) 
    : config.style
  const resolvedClassName = formContext && typeof config.className === 'function' 
    ? (config.className as any)(formContext) 
    : config.className

  const sliderConfig = config as any

  return (
    <Slider
      disabled={disabled || (resolvedDisabled as boolean)}
      style={resolvedStyle as React.CSSProperties}
      className={resolvedClassName as string}
      min={sliderConfig.min}
      max={sliderConfig.max}
      step={sliderConfig.step}
      marks={sliderConfig.marks}
      range={sliderConfig.range}
      vertical={sliderConfig.vertical}
      tooltip={{ open: sliderConfig.tooltipVisible }}
      value={value}
      onChange={onChange}
    />
  )
}

// 颜色选择器组件
export const ColorPickerItem: React.FC<OtherItemProps> = ({ config, value, onChange, disabled, formContext }) => {
  // 解析函数参数
  const resolvedDisabled = formContext && typeof config.disabled === 'function' 
    ? (config.disabled as any)(formContext) 
    : config.disabled
  const resolvedStyle = formContext && typeof config.style === 'function' 
    ? (config.style as any)(formContext) 
    : config.style
  const resolvedClassName = formContext && typeof config.className === 'function' 
    ? (config.className as any)(formContext) 
    : config.className

  const colorPickerConfig = config as any

  return (
    <ColorPicker
      disabled={disabled || (resolvedDisabled as boolean)}
      style={resolvedStyle as React.CSSProperties}
      className={resolvedClassName as string}
      format={colorPickerConfig.format}
      showText={colorPickerConfig.showText}
      allowClear={colorPickerConfig.allowClear}
      presets={colorPickerConfig.presets}
      value={value}
      onChange={onChange}
    />
  )
}

// 自定义组件
export const CustomItem: React.FC<OtherItemProps> = ({ config, value, onChange, disabled, formContext }) => {
  // 解析函数参数
  const resolvedDisabled = formContext && typeof config.disabled === 'function' 
    ? (config.disabled as any)(formContext) 
    : config.disabled
  const resolvedStyle = formContext && typeof config.style === 'function' 
    ? (config.style as any)(formContext) 
    : config.style
  const resolvedClassName = formContext && typeof config.className === 'function' 
    ? (config.className as any)(formContext) 
    : config.className

  const customConfig = config as any
  const CustomComponent = customConfig.component
  
  // 合并属性，componentProps 中的属性优先级更高
  const mergedProps = {
    disabled: disabled || (resolvedDisabled as boolean),
    style: resolvedStyle as React.CSSProperties,
    className: resolvedClassName as string,
    ...customConfig.componentProps, // componentProps 中的属性
    value: value, // Form 传递的 value 优先级最高
    onChange: onChange, // Form 传递的 onChange 优先级最高
  }
  return <CustomComponent {...mergedProps} />
}
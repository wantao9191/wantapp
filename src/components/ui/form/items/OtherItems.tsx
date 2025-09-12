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
      allowClear={rateConfig.allowClear}
      allowHalf={rateConfig.allowHalf}
      character={rateConfig.character}
      className={resolvedClassName as string}
      count={rateConfig.count}
      disabled={disabled || (resolvedDisabled as boolean)}
      style={resolvedStyle as React.CSSProperties}
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
      className={resolvedClassName as string}
      disabled={disabled || (resolvedDisabled as boolean)}
      marks={sliderConfig.marks}
      max={sliderConfig.max}
      min={sliderConfig.min}
      range={sliderConfig.range}
      step={sliderConfig.step}
      style={resolvedStyle as React.CSSProperties}
      tooltip={{ open: sliderConfig.tooltipVisible }}
      value={value}
      vertical={sliderConfig.vertical}
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
      allowClear={colorPickerConfig.allowClear}
      className={resolvedClassName as string}
      disabled={disabled || (resolvedDisabled as boolean)}
      format={colorPickerConfig.format}
      presets={colorPickerConfig.presets}
      showText={colorPickerConfig.showText}
      style={resolvedStyle as React.CSSProperties}
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
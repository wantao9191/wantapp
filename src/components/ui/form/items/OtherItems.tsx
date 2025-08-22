'use client'

import React from 'react'
import { Rate, Slider, ColorPicker } from 'antd'
import type { FormItemConfig } from '@/types/form-config'

interface OtherItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
}

// 评分组件
export const RateItem: React.FC<OtherItemProps> = ({ config, value, onChange, disabled }) => {
  const rateConfig = config as any

  return (
    <Rate
      disabled={disabled || config.disabled}
      style={config.style}
      className={config.className}
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
export const SliderItem: React.FC<OtherItemProps> = ({ config, value, onChange, disabled }) => {
  const sliderConfig = config as any

  return (
    <Slider
      disabled={disabled || config.disabled}
      style={config.style}
      className={config.className}
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
export const ColorPickerItem: React.FC<OtherItemProps> = ({ config, value, onChange, disabled }) => {
  const colorPickerConfig = config as any

  return (
    <ColorPicker
      disabled={disabled || config.disabled}
      style={config.style}
      className={config.className}
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
export const CustomItem: React.FC<OtherItemProps> = ({ config, value, onChange, disabled }) => {
  const customConfig = config as any
  const CustomComponent = customConfig.component

  return (
    <CustomComponent
      disabled={disabled || config.disabled}
      style={config.style}
      className={config.className}
      {...customConfig.componentProps}
      value={value}
      onChange={onChange}
    />
  )
}
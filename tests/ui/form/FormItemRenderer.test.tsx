import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import FormItemRenderer from '@/components/ui/Form/FormItemRenderer'
import type { FormItemConfig } from '@/types/form-config'

// Mock 所有表单项组件
vi.mock('@/components/ui/Form/Items', () => ({
  InputItem: ({ config, value, onChange, disabled }: any) => (
    <input
      data-testid={`input-${config.name}`}
      type="text"
      placeholder={config.placeholder}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    />
  ),
  NumberItem: ({ config, value, onChange, disabled }: any) => (
    <input
      data-testid="number-item"
      type="number"
      placeholder={config.placeholder}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    />
  ),
  SelectItem: ({ config, value, onChange, disabled }: any) => (
    <select
      data-testid="select-item"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    >
      <option value="">请选择</option>
      {config.options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  RadioItem: ({ config, value, onChange, disabled }: any) => (
    <div data-testid="radio-item">
      {config.options?.map((opt: any) => (
        <label key={opt.value}>
          <input
            type="radio"
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
          />
          {opt.label}
        </label>
      ))}
    </div>
  ),
  CheckboxItem: ({ config, value, onChange, disabled }: any) => (
    <div data-testid="checkbox-item">
      {config.options?.map((opt: any) => (
        <label key={opt.value}>
          <input
            type="checkbox"
            value={opt.value}
            checked={Array.isArray(value) && value.includes(opt.value)}
            onChange={(e) => {
              const newValue = Array.isArray(value) ? [...value] : []
              if (e.target.checked) {
                newValue.push(opt.value)
              } else {
                const index = newValue.indexOf(opt.value)
                if (index > -1) {
                  newValue.splice(index, 1)
                }
              }
              onChange?.(newValue)
            }}
            disabled={disabled}
          />
          {opt.label}
        </label>
      ))}
    </div>
  ),
  SwitchItem: ({ config, value, onChange, disabled }: any) => (
    <input
      data-testid="switch-item"
      type="checkbox"
      checked={value}
      onChange={(e) => onChange?.(e.target.checked)}
      disabled={disabled}
    />
  ),
  DateItem: ({ config, value, onChange, disabled }: any) => (
    <input
      data-testid="date-item"
      type="date"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    />
  ),
  UploadItem: ({ config, value, onChange, disabled }: any) => (
    <div data-testid="upload-item">
      <input
        type="file"
        onChange={(e) => onChange?.(e.target.files)}
        disabled={disabled}
      />
    </div>
  ),
  CascaderItem: ({ config, value, onChange, disabled }: any) => (
    <select
      data-testid="cascader-item"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    >
      <option value="">请选择</option>
    </select>
  ),
  TreeSelectItem: ({ config, value, onChange, disabled }: any) => (
    <select
      data-testid="tree-select-item"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    >
      <option value="">请选择</option>
    </select>
  ),
  RateItem: ({ config, value, onChange, disabled }: any) => (
    <div data-testid="rate-item">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange?.(star)}
          disabled={disabled}
        >
          {star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  ),
  SliderItem: ({ config, value, onChange, disabled }: any) => (
    <input
      data-testid="slider-item"
      type="range"
      min={config.min || 0}
      max={config.max || 100}
      value={value || 0}
      onChange={(e) => onChange?.(Number(e.target.value))}
      disabled={disabled}
    />
  ),
  ColorPickerItem: ({ config, value, onChange, disabled }: any) => (
    <input
      data-testid="color-picker-item"
      type="color"
      value={value || '#000000'}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    />
  ),
  CustomItem: ({ config, value, onChange, disabled }: any) => (
    <div data-testid="custom-item">
      {config.render?.(value, onChange, disabled) || '自定义组件'}
    </div>
  )
}))

describe('FormItemRenderer', () => {
  const mockConfig: FormItemConfig = {
    name: 'test',
    label: '测试字段',
    type: 'input',
    placeholder: '请输入'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染 input 类型的表单项', () => {
    render(
      <FormItemRenderer
        config={mockConfig}
        value="test value"
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('input-test')).toBeInTheDocument()
    expect(screen.getByTestId('input-test')).toHaveValue('test value')
  })

  it('应该正确渲染 number 类型的表单项', () => {
    const numberConfig = { ...mockConfig, type: 'number' }
    
    render(
      <FormItemRenderer
        config={numberConfig}
        value="42"
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('number-age')).toBeInTheDocument()
    expect(screen.getByTestId('number-age')).toHaveValue('42')
  })

  it('应该正确渲染 select 类型的表单项', () => {
    const selectConfig = {
      ...mockConfig,
      type: 'select',
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' }
      ]
    }
    
    render(
      <FormItemRenderer
        config={selectConfig}
        value="1"
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('select-item')).toBeInTheDocument()
    expect(screen.getByText('选项1')).toBeInTheDocument()
    expect(screen.getByText('选项2')).toBeInTheDocument()
  })

  it('应该正确渲染 radio 类型的表单项', () => {
    const radioConfig = {
      ...mockConfig,
      type: 'radio',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]
    }
    
    render(
      <FormItemRenderer
        config={radioConfig}
        value="male"
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('radio-item')).toBeInTheDocument()
    expect(screen.getByText('男')).toBeInTheDocument()
    expect(screen.getByText('女')).toBeInTheDocument()
  })

  it('应该正确渲染 checkbox 类型的表单项', () => {
    const checkboxConfig = {
      ...mockConfig,
      type: 'checkbox',
      options: [
        { label: '阅读', value: 'reading' },
        { label: '写作', value: 'writing' }
      ]
    }
    
    render(
      <FormItemRenderer
        config={checkboxConfig}
        value={['reading']}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('checkbox-item')).toBeInTheDocument()
    expect(screen.getByText('阅读')).toBeInTheDocument()
    expect(screen.getByText('写作')).toBeInTheDocument()
  })

  it('应该正确渲染 switch 类型的表单项', () => {
    const switchConfig = { ...mockConfig, type: 'switch' }
    
    render(
      <FormItemRenderer
        config={switchConfig}
        value={true}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('switch-item')).toBeInTheDocument()
    expect(screen.getByTestId('switch-item')).toBeChecked()
  })

  it('应该正确渲染 date 类型的表单项', () => {
    const dateConfig = { ...mockConfig, type: 'date' }
    
    render(
      <FormItemRenderer
        config={dateConfig}
        value="2024-01-01"
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('date-item')).toBeInTheDocument()
    expect(screen.getByTestId('date-item')).toHaveValue('2024-01-01')
  })

  it('应该正确渲染 upload 类型的表单项', () => {
    const uploadConfig = { ...mockConfig, type: 'upload' }
    
    render(
      <FormItemRenderer
        config={uploadConfig}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('upload-item')).toBeInTheDocument()
  })

  it('应该正确渲染 cascader 类型的表单项', () => {
    const cascaderConfig = { ...mockConfig, type: 'cascader' }
    
    render(
      <FormItemRenderer
        config={cascaderConfig}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('cascader-item')).toBeInTheDocument()
  })

  it('应该正确渲染 treeSelect 类型的表单项', () => {
    const treeSelectConfig = { ...mockConfig, type: 'treeSelect' }
    
    render(
      <FormItemRenderer
        config={treeSelectConfig}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('tree-select-item')).toBeInTheDocument()
  })

  it('应该正确渲染 rate 类型的表单项', () => {
    const rateConfig = { ...mockConfig, type: 'rate' }
    
    render(
      <FormItemRenderer
        config={rateConfig}
        value={3}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('rate-item')).toBeInTheDocument()
  })

  it('应该正确渲染 slider 类型的表单项', () => {
    const sliderConfig = { ...mockConfig, type: 'slider' }
    
    render(
      <FormItemRenderer
        config={sliderConfig}
        value={50}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('slider-item')).toBeInTheDocument()
    expect(screen.getByTestId('slider-item')).toHaveValue('50')
  })

  it('应该正确渲染 colorPicker 类型的表单项', () => {
    const colorPickerConfig = { ...mockConfig, type: 'colorPicker' }
    
    render(
      <FormItemRenderer
        config={colorPickerConfig}
        value="#ff0000"
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('color-picker-item')).toBeInTheDocument()
    expect(screen.getByTestId('color-picker-item')).toHaveValue('#ff0000')
  })

  it('应该正确渲染 custom 类型的表单项', () => {
    const customConfig = { ...mockConfig, type: 'custom' }
    
    render(
      <FormItemRenderer
        config={customConfig}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('custom-item')).toBeInTheDocument()
  })

  it('应该支持 textarea 类型', () => {
    const textareaConfig = { ...mockConfig, type: 'textarea' }
    
    render(
      <FormItemRenderer
        config={textareaConfig}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('input-test')).toBeInTheDocument()
  })

  it('应该支持 password 类型', () => {
    const passwordConfig = { ...mockConfig, type: 'password' }
    
    render(
      <FormItemRenderer
        config={passwordConfig}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('input-test')).toBeInTheDocument()
  })

  it('应该支持 multiSelect 类型', () => {
    const multiSelectConfig = { ...mockConfig, type: 'multiSelect' }
    
    render(
      <FormItemRenderer
        config={multiSelectConfig}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('select-item')).toBeInTheDocument()
  })

  it('应该支持 dateRange 类型', () => {
    const dateRangeConfig = { ...mockConfig, type: 'dateRange' }
    
    render(
      <FormItemRenderer
        config={dateRangeConfig}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('date-item')).toBeInTheDocument()
  })

  it('应该支持 time 类型', () => {
    const timeConfig = { ...mockConfig, type: 'time' }
    
    render(
      <FormItemRenderer
        config={timeConfig}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('date-item')).toBeInTheDocument()
  })

  it('应该处理未知类型并回退到默认 Input', () => {
    const unknownConfig = { ...mockConfig, type: 'unknown' }
    
    render(
      <FormItemRenderer
        config={unknownConfig}
        onChange={vi.fn()}
      />
    )
    
    // 应该回退到默认的 Input 组件
    const input = screen.getByPlaceholderText('请输入')
    expect(input).toBeInTheDocument()
  })

  it('应该传递 disabled 属性', () => {
    render(
      <FormItemRenderer
        config={mockConfig}
        disabled={true}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('input-item')).toBeDisabled()
  })

  it('应该处理 onChange 回调', () => {
    const onChange = vi.fn()
    
    render(
      <FormItemRenderer
        config={mockConfig}
        onChange={onChange}
      />
    )
    
    const input = screen.getByTestId('input-item')
    fireEvent.change(input, { target: { value: 'new value' } })
    
    expect(onChange).toHaveBeenCalledWith('new value')
  })

  it('应该处理 config 中的 disabled 属性', () => {
    const disabledConfig = { ...mockConfig, disabled: true }
    
    render(
      <FormItemRenderer
        config={disabledConfig}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByTestId('input-item')).toBeDisabled()
  })

  it('应该支持 config 中的 style 和 className', () => {
    const styledConfig = {
      ...mockConfig,
      style: { color: 'red' },
      className: 'custom-class'
    }
    
    render(
      <FormItemRenderer
        config={styledConfig}
        onChange={vi.fn()}
      />
    )
    
    const input = screen.getByTestId('input-item')
    expect(input).toHaveStyle({ color: 'red' })
    expect(input).toHaveClass('custom-class')
  })
})
import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import ConfigForm from '@/components/ui/ConfigForm'
import type { FormConfig, FormItemConfig } from '@/types/form-config'

// Mock FormItemRenderer
vi.mock('@/components/ui/Form/FormItemRenderer', () => ({
  default: ({ config, disabled }: { config: FormItemConfig; disabled: boolean }) => {
    const { type, name } = config
    if (type === 'input') {
      return <input data-testid={`input-${name}`} disabled={disabled} />
    }
    if (type === 'checkbox') {
      return <input type="checkbox" data-testid={`checkbox-${name}`} disabled={disabled} />
    }
    if (type === 'switch') {
      return <input type="checkbox" data-testid={`switch-${name}`} disabled={disabled} />
    }
    return <div data-testid={`field-${name}`}>Field {name}</div>
  }
}))

// Mock utils
vi.mock('@/lib/utils', () => ({
  removeUndefined: vi.fn((obj) => obj)
}))

describe('ConfigForm', () => {
  const mockConfig: FormConfig = {
    items: [
      {
        name: 'username',
        label: '用户名',
        type: 'input',
        required: true,
        span: 12
      },
      {
        name: 'email',
        label: '邮箱',
        type: 'input',
        required: false,
        span: 12
      }
    ],
    layout: 'vertical',
    size: 'middle'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染表单', () => {
    render(<ConfigForm config={mockConfig} />)
    
    expect(screen.getByText('用户名')).toBeInTheDocument()
    expect(screen.getByText('邮箱')).toBeInTheDocument()
  })

  it('应该支持禁用状态', () => {
    render(<ConfigForm config={mockConfig} disabled={true} />)
    
    const usernameInput = screen.getByTestId('input-username')
    const emailInput = screen.getByTestId('input-email')
    
    expect(usernameInput).toBeDisabled()
    expect(emailInput).toBeDisabled()
  })

  it('应该支持加载状态', () => {
    render(<ConfigForm config={mockConfig} loading={true} />)
    
    const usernameInput = screen.getByTestId('input-username')
    const emailInput = screen.getByTestId('input-email')
    
    expect(usernameInput).toBeDisabled()
    expect(emailInput).toBeDisabled()
  })
})

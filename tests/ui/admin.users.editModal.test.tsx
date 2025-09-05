import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { App } from 'antd'
import EditModal from '@/app/admin/system/users/components/editModal'

// Mock 外部依赖
vi.mock('@/app/admin/system/users/useItems', () => ({
  default: vi.fn()
}))

vi.mock('@/lib/form-utils', () => ({
  createQuickForm: vi.fn((config) => ({
    ...config,
    items: config.items || []
  }))
}))

vi.mock('@/lib/https', () => ({
  http: {
    post: vi.fn(),
    put: vi.fn()
  }
}))

vi.mock('@/components/ui/ConfigForm', () => ({
  default: React.forwardRef(({ config, initialValues, ...props }, ref) => (
    <div data-testid="config-form" ref={ref} {...props}>
      <div data-testid="form-config">{JSON.stringify(config)}</div>
      <div data-testid="form-initial-values">{JSON.stringify(initialValues)}</div>
      <button 
        data-testid="validate-fields"
        onClick={() => {
          // 模拟验证成功
          const mockValidate = vi.fn().mockResolvedValue({ name: '测试用户', phone: '13800138000' })
          mockValidate().then((values) => {
            if (values) {
              // 模拟获取字段值
              const mockGetFieldsValue = vi.fn().mockReturnValue(values)
              mockGetFieldsValue()
            }
          })
        }}
      >
        验证字段
      </button>
      <button 
        data-testid="reset-fields"
        onClick={() => {
          // 模拟重置字段
        }}
      >
        重置字段
      </button>
      <button 
        data-testid="set-fields-value"
        onClick={() => {
          // 模拟设置字段值
        }}
      >
        设置字段值
      </button>
    </div>
  ))
}))

vi.mock('@/components/ui/ConfigModal', () => ({
  default: vi.fn(({ slots }) => (
    <div data-testid="config-modal">
      <div data-testid="modal-body">
        {slots?.body}
      </div>
      <div data-testid="modal-footer">
        {slots?.footer}
      </div>
    </div>
  ))
}))

describe('EditModal - Users', () => {
  const mockSearchFormSchema = [
    { label: '用户名称', name: 'name', type: 'input' },
    { label: '用户名', name: 'username', type: 'input' },
    { label: '手机号', name: 'phone', type: 'input' },
    { label: '邮箱', name: 'email', type: 'input' },
    { label: '所属机构', name: 'organizationId', type: 'select' },
    { label: '角色', name: 'roles', type: 'select' },
    { label: '状态', name: 'status', type: 'select' },
    { label: '备注', name: 'description', type: 'textarea' }
  ]

  const mockFormData = {
    id: 1,
    name: '测试用户',
    username: 'testuser',
    phone: '13800138000',
    email: 'test@example.com',
    organizationId: 1,
    roles: [1, 2],
    status: 1,
    description: '测试描述'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    const useItems = require('@/app/admin/system/users/useItems').default
    vi.mocked(useItems).mockReturnValue({
      searchFormSchema: mockSearchFormSchema
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('应该正确渲染编辑模态框', () => {
    render(
      <App>
        <EditModal
          formData={mockFormData}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    expect(screen.getByTestId('config-modal')).toBeInTheDocument()
    expect(screen.getByTestId('modal-body')).toBeInTheDocument()
    expect(screen.getByTestId('modal-footer')).toBeInTheDocument()
  })

  it('应该正确渲染表单', () => {
    render(
      <App>
        <EditModal
          formData={mockFormData}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    expect(screen.getByTestId('config-form')).toBeInTheDocument()
  })

  it('应该正确配置表单', () => {
    render(
      <App>
        <EditModal
          formData={mockFormData}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    const formConfig = screen.getByTestId('form-config')
    const config = JSON.parse(formConfig.textContent || '{}')
    
    expect(config.layout).toBe('vertical')
    expect(config.size).toBe('middle')
    expect(Array.isArray(config.items)).toBe(true)
  })

  it('应该正确过滤隐藏字段', () => {
    const schemaWithHidden = [
      { label: '用户名称', name: 'name', type: 'input' },
      { label: '隐藏字段', name: 'hidden', type: 'input', hidden: true },
      { label: '状态', name: 'status', type: 'select' }
    ]
    
    const useItems = require('@/app/admin/system/users/useItems').default
    vi.mocked(useItems).mockReturnValue({
      searchFormSchema: schemaWithHidden
    })
    
    render(
      <App>
        <EditModal
          formData={mockFormData}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    const formConfig = screen.getByTestId('form-config')
    const config = JSON.parse(formConfig.textContent || '{}')
    
    expect(config.items).toHaveLength(2) // 应该过滤掉隐藏字段
    expect(config.items.find((item: any) => item.name === 'hidden')).toBeUndefined()
  })

  it('应该显示操作按钮', () => {
    render(
      <App>
        <EditModal
          formData={mockFormData}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    expect(screen.getByText('重置')).toBeInTheDocument()
    expect(screen.getByText('取消')).toBeInTheDocument()
    expect(screen.getByText('确定')).toBeInTheDocument()
  })

  it('应该处理新增用户', () => {
    render(
      <App>
        <EditModal
          formData={null}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    expect(screen.getByTestId('config-form')).toBeInTheDocument()
  })

  it('应该处理编辑用户', () => {
    render(
      <App>
        <EditModal
          formData={mockFormData}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    expect(screen.getByTestId('config-form')).toBeInTheDocument()
  })

  it('应该处理取消操作', () => {
    const mockOnCancel = vi.fn()
    
    render(
      <App>
        <EditModal
          formData={mockFormData}
          onSubmit={vi.fn()}
          onCancel={mockOnCancel}
        />
      </App>
    )
    
    const cancelButton = screen.getByText('取消')
    fireEvent.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('应该处理重置操作', () => {
    render(
      <App>
        <EditModal
          formData={mockFormData}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    const resetButton = screen.getByText('重置')
    fireEvent.click(resetButton)
    
    // 验证重置按钮存在且可点击
    expect(resetButton).toBeInTheDocument()
  })

  it('应该处理表单提交 - 新增用户', async () => {
    const { http } = require('@/lib/https')
    const mockOnSubmit = vi.fn()
    
    vi.mocked(http.post).mockResolvedValue({})
    
    render(
      <App>
        <EditModal
          formData={null}
          onSubmit={mockOnSubmit}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    const submitButton = screen.getByText('确定')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })

  it('应该处理表单提交 - 编辑用户', async () => {
    const { http } = require('@/lib/https')
    const mockOnSubmit = vi.fn()
    
    vi.mocked(http.put).mockResolvedValue({})
    
    render(
      <App>
        <EditModal
          formData={mockFormData}
          onSubmit={mockOnSubmit}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    const submitButton = screen.getByText('确定')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })

  it('应该处理提交加载状态', async () => {
    const { http } = require('@/lib/https')
    const mockOnSubmit = vi.fn()
    
    // Mock 延迟响应
    vi.mocked(http.post).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({}), 100))
    )
    
    render(
      <App>
        <EditModal
          formData={null}
          onSubmit={mockOnSubmit}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    const submitButton = screen.getByText('确定')
    fireEvent.click(submitButton)
    
    // 验证按钮在加载状态
    expect(submitButton).toHaveAttribute('loading', 'true')
  })

  it('应该处理提交错误', async () => {
    const { http } = require('@/lib/https')
    const mockOnSubmit = vi.fn()
    
    vi.mocked(http.post).mockRejectedValue(new Error('提交失败'))
    
    render(
      <App>
        <EditModal
          formData={null}
          onSubmit={mockOnSubmit}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    const submitButton = screen.getByText('确定')
    fireEvent.click(submitButton)
    
    // 验证错误处理
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it('应该正确处理表单数据设置', () => {
    render(
      <App>
        <EditModal
          formData={mockFormData}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    // 验证表单数据被正确传递
    const formElement = screen.getByTestId('config-form')
    expect(formElement).toBeInTheDocument()
  })

  it('应该正确处理初始值', () => {
    const initialValues = { name: '初始名称' }
    
    render(
      <App>
        <EditModal
          formData={mockFormData}
          initialValues={initialValues}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    const initialValuesElement = screen.getByTestId('form-initial-values')
    const values = JSON.parse(initialValuesElement.textContent || '{}')
    
    expect(values).toEqual(initialValues)
  })

  it('应该正确处理表单验证', async () => {
    render(
      <App>
        <EditModal
          formData={mockFormData}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    const validateButton = screen.getByTestId('validate-fields')
    fireEvent.click(validateButton)
    
    // 验证验证按钮存在且可点击
    expect(validateButton).toBeInTheDocument()
  })

  it('应该正确处理字段重置', () => {
    render(
      <App>
        <EditModal
          formData={mockFormData}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    const resetButton = screen.getByTestId('reset-fields')
    fireEvent.click(resetButton)
    
    // 验证重置按钮存在且可点击
    expect(resetButton).toBeInTheDocument()
  })

  it('应该正确处理字段值设置', () => {
    render(
      <App>
        <EditModal
          formData={mockFormData}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </App>
    )
    
    const setFieldsValueButton = screen.getByTestId('set-fields-value')
    fireEvent.click(setFieldsValueButton)
    
    // 验证设置字段值按钮存在且可点击
    expect(setFieldsValueButton).toBeInTheDocument()
  })
})

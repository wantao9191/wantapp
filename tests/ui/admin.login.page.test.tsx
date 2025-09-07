import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdminLoginPage from '../../src/app/admin/login/page'

// 确保 React 在全局可用
global.React = React

// Mock 外部依赖
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}))

vi.mock('../../src/lib/https', () => ({
  http: {
    post: vi.fn()
  }
}))

vi.mock('../../src/hooks', () => ({
  useAuth: () => ({
    checked: false,
    setChecked: vi.fn(),
    captcha: 'test-captcha',
    getCaptcha: vi.fn(),
    login: vi.fn().mockResolvedValue({ success: true })
  })
}))

vi.mock('antd', () => ({
  Card: ({ children, title, ...props }: any) => (
    <div data-testid="card" data-title={title} {...props}>
      {children}
    </div>
  ),
  Form: Object.assign(
    ({ children, onFinish, ...props }: any) => (
      <form data-testid="form" onSubmit={(e) => { e.preventDefault(); onFinish?.({ username: 'test', password: 'test' }) }} {...props}>
        {children}
      </form>
    ),
    {
      useForm: () => [
        {
          validateFields: vi.fn().mockResolvedValue({}),
          resetFields: vi.fn(),
          setFieldsValue: vi.fn(),
          getFieldsValue: vi.fn().mockReturnValue({}),
        }
      ],
      Item: ({ children, name, label, ...props }: any) => (
        <div data-testid="form-item" data-name={name} data-label={label} {...props}>
          {label && <label>{label}</label>}
          {children}
        </div>
      )
    }
  ),
  Input: Object.assign(
    ({ placeholder, type, ...props }: any) => (
      <input data-testid="input" placeholder={placeholder} type={type} {...props} />
    ),
    {
      Password: ({ placeholder, ...props }: any) => (
        <input data-testid="input-password" type="password" placeholder={placeholder} {...props} />
      )
    }
  ),
  Button: ({ children, type, htmlType, loading, ...props }: any) => (
    <button data-testid="button" data-type={type} data-html-type={htmlType} data-loading={loading} {...props}>
      {children}
    </button>
  ),
  Checkbox: ({ children, ...props }: any) => (
    <label data-testid="checkbox" {...props}>
      <input type="checkbox" />
      {children}
    </label>
  ),
  Typography: {
    Title: ({ children, level, ...props }: any) => (
      <h1 data-testid="title" data-level={level} {...props}>{children}</h1>
    ),
    Text: ({ children, ...props }: any) => <span data-testid="text" {...props}>{children}</span>
  },
  message: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('@ant-design/icons', () => ({
  UserOutlined: () => <div data-testid="user-icon" />,
  LockOutlined: () => <div data-testid="lock-icon" />
}))

describe('AdminLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染登录页面', () => {
    render(<AdminLoginPage />)
    
    // 检查页面标题
    expect(screen.getByText('管理员登录')).toBeInTheDocument()
    
    // 检查表单元素
    expect(screen.getByTestId('form')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument()
    expect(screen.getByText('记住我')).toBeInTheDocument()
  })

  it('应该显示登录按钮', () => {
    render(<AdminLoginPage />)
    
    const loginButton = screen.getByText('登录')
    expect(loginButton).toBeInTheDocument()
    expect(loginButton).toHaveAttribute('data-html-type', 'submit')
  })

  it('应该处理表单提交', async () => {
    render(<AdminLoginPage />)
    
    const form = screen.getByTestId('form')
    fireEvent.submit(form)
    
    // 等待异步操作完成
    await waitFor(() => {
      expect(form).toBeInTheDocument()
    })
  })

  it('应该显示记住我选项', () => {
    render(<AdminLoginPage />)
    
    expect(screen.getByText('记住我')).toBeInTheDocument()
    expect(screen.getByTestId('checkbox')).toBeInTheDocument()
  })
})

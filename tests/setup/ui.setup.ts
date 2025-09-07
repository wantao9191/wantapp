import '@testing-library/jest-dom/vitest'
import { vi, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// 模拟 window.matchMedia API
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 模拟 ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟 IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock Ant Design Icons
vi.mock('@ant-design/icons', async () => {
  const actual = await vi.importActual('@ant-design/icons')
  return {
    ...actual,
    UserOutlined: vi.fn(() => React.createElement('span', { 'data-testid': 'user-outlined' }, 'UserIcon')),
    TeamOutlined: vi.fn(() => React.createElement('span', { 'data-testid': 'team-outlined' }, 'TeamIcon')),
    SettingOutlined: vi.fn(() => React.createElement('span', { 'data-testid': 'setting-outlined' }, 'SettingIcon')),
    FileTextOutlined: vi.fn(() => React.createElement('span', { 'data-testid': 'file-text-outlined' }, 'FileTextIcon')),
    RiseOutlined: vi.fn(() => React.createElement('span', { 'data-testid': 'rise-outlined' }, 'RiseIcon')),
    FallOutlined: vi.fn(() => React.createElement('span', { 'data-testid': 'fall-outlined' }, 'FallIcon')),
    CheckCircleOutlined: vi.fn(() => React.createElement('span', { 'data-testid': 'check-circle-outlined' }, 'CheckCircleIcon')),
    ClockCircleOutlined: vi.fn(() => React.createElement('span', { 'data-testid': 'clock-circle-outlined' }, 'ClockCircleIcon')),
    ExclamationCircleOutlined: vi.fn(() => React.createElement('span', { 'data-testid': 'exclamation-circle-outlined' }, 'ExclamationCircleIcon')),
    BarChartOutlined: vi.fn(() => React.createElement('span', { 'data-testid': 'bar-chart-outlined' }, 'BarChartIcon')),
    PieChartOutlined: vi.fn(() => React.createElement('span', { 'data-testid': 'pie-chart-outlined' }, 'PieChartIcon')),
    LineChartOutlined: vi.fn(() => React.createElement('span', { 'data-testid': 'line-chart-outlined' }, 'LineChartIcon')),
  }
})

// Mock Ant Design 的 ConfigProvider
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd')
  return {
    ...actual,
    ConfigProvider: ({ children }: any) => children,
    App: {
      useApp: () => ({
        message: {
          success: vi.fn(),
          error: vi.fn(),
          warning: vi.fn(),
          info: vi.fn(),
        },
        modal: {
          confirm: vi.fn(),
          info: vi.fn(),
          success: vi.fn(),
          error: vi.fn(),
          warning: vi.fn(),
        },
      }),
    },
    Form: Object.assign(
      ({ children, onFinish }: any) => 
        React.createElement('form', { 'data-testid': 'form', onSubmit: onFinish }, children),
      {
        useForm: () => [
          {
            validateFields: vi.fn().mockResolvedValue({}),
            resetFields: vi.fn(),
            setFieldsValue: vi.fn(),
            getFieldsValue: vi.fn().mockReturnValue({}),
          }
        ],
        Item: ({ children, name, label }: any) => 
          React.createElement('div', { 'data-testid': 'form-item', 'data-name': name, 'data-label': label }, 
            label && React.createElement('label', null, label),
            children
          )
      }
    ),
    Input: Object.assign(
      ({ placeholder, ...props }: any) => 
        React.createElement('input', { 'data-testid': 'input', placeholder, ...props }),
      {
        Password: ({ placeholder, ...props }: any) => 
          React.createElement('input', { 'data-testid': 'input-password', type: 'password', placeholder, ...props })
      }
    ),
    Button: ({ children, loading, ...props }: any) => 
      React.createElement('button', { 'data-testid': 'button', disabled: loading, ...props }, 
        loading ? 'Loading...' : children
      ),
    Checkbox: ({ children, ...props }: any) => 
      React.createElement('label', { 'data-testid': 'checkbox' },
        React.createElement('input', { type: 'checkbox', ...props }),
        children
      ),
    Image: ({ src, alt, ...props }: any) => 
      React.createElement('img', { 'data-testid': 'image', src, alt, ...props }),
  }
})

// Mock Next.js 的 useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}))

// 每个测试后清理 DOM
afterEach(() => {
  cleanup()
})


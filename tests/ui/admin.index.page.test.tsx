import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminIndexPage from '../../src/app/admin/index/page'

// Mock 外部依赖
vi.mock('../../src/components/layouts/BasicLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="basic-layout">{children}</div>
}))

vi.mock('antd', () => ({
  Card: ({ children, title, ...props }: any) => (
    <div data-testid="card" data-title={title} {...props}>
      {children}
    </div>
  ),
  Row: ({ children, ...props }: any) => <div data-testid="row" {...props}>{children}</div>,
  Col: ({ children, span, ...props }: any) => <div data-testid="col" data-span={span} {...props}>{children}</div>,
  Progress: ({ percent, ...props }: any) => <div data-testid="progress" data-percent={percent} {...props} />,
  Avatar: ({ children, ...props }: any) => <div data-testid="avatar" {...props}>{children}</div>,
  List: ({ children, dataSource, ...props }: any) => (
    <div data-testid="list" data-source={JSON.stringify(dataSource)} {...props}>
      {children}
    </div>
  ),
  Button: ({ children, ...props }: any) => <button data-testid="button" {...props}>{children}</button>,
  Typography: {
    Title: ({ children, level, ...props }: any) => (
      <h1 data-testid="title" data-level={level} {...props}>{children}</h1>
    ),
    Text: ({ children, ...props }: any) => <span data-testid="text" {...props}>{children}</span>
  }
}))

vi.mock('@ant-design/icons', () => ({
  UserOutlined: () => <div data-testid="user-icon" />,
  TeamOutlined: () => <div data-testid="team-icon" />,
  SettingOutlined: () => <div data-testid="setting-icon" />,
  FileTextOutlined: () => <div data-testid="file-icon" />,
  RiseOutlined: () => <div data-testid="rise-icon" />,
  FallOutlined: () => <div data-testid="fall-icon" />,
  CheckCircleOutlined: () => <div data-testid="check-icon" />,
  ClockCircleOutlined: () => <div data-testid="clock-icon" />,
  ExclamationCircleOutlined: () => <div data-testid="exclamation-icon" />,
  BarChartOutlined: () => <div data-testid="chart-icon" />
}))

describe('AdminIndexPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染管理员首页', () => {
    render(<AdminIndexPage />)
    
    // 检查页面是否渲染
    expect(screen.getByTestId('basic-layout')).toBeInTheDocument()
    
    // 检查统计卡片
    expect(screen.getAllByTestId('card')).toHaveLength(6)
    
    // 检查标题
    expect(screen.getByText('系统概览')).toBeInTheDocument()
    expect(screen.getByText('用户统计')).toBeInTheDocument()
    expect(screen.getByText('系统状态')).toBeInTheDocument()
  })

  it('应该显示用户统计信息', () => {
    render(<AdminIndexPage />)
    
    // 检查用户统计卡片
    const userStatsCard = screen.getByText('用户统计')
    expect(userStatsCard).toBeInTheDocument()
    
    // 检查进度条
    expect(screen.getAllByTestId('progress')).toHaveLength(2)
  })

  it('应该显示系统状态信息', () => {
    render(<AdminIndexPage />)
    
    // 检查系统状态卡片
    expect(screen.getByText('系统状态')).toBeInTheDocument()
    expect(screen.getByText('运行正常')).toBeInTheDocument()
  })

  it('应该显示最近活动列表', () => {
    render(<AdminIndexPage />)
    
    // 检查最近活动
    expect(screen.getByText('最近活动')).toBeInTheDocument()
    expect(screen.getByTestId('list')).toBeInTheDocument()
  })
})

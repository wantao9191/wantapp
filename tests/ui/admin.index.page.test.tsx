import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminIndexPage from '../../src/app/admin/index/page'

// Mock 外部依赖
vi.mock('../../src/components/layouts/BasicLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="basic-layout">{children}</div>
}))

vi.mock('antd', () => ({
  Card: ({ children, title }: any) => (
    <div data-testid="card" data-title={title}>
      {title && <div data-testid="card-title">{title}</div>}
      {children}
    </div>
  ),
  Row: ({ children }: any) => <div data-testid="row">{children}</div>,
  Col: ({ children, span }: any) => <div data-testid="col" data-span={span}>{children}</div>,
  Progress: ({ percent, type, format }: any) => (
    <div data-testid="progress" data-percent={percent} data-type={type}>
      {format && format()}
    </div>
  ),
  Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
  List: Object.assign(
    ({ children, dataSource, renderItem }: any) => (
      <div data-testid="list">
        {dataSource && renderItem && dataSource.map((item: any, index: number) => (
          <div key={index} data-testid="list-item">
            {renderItem(item)}
          </div>
        ))}
        {children}
      </div>
    ),
    {
      Item: Object.assign(
        ({ children }: any) => <div data-testid="list-item">{children}</div>,
        {
          Meta: ({ avatar, title, description }: any) => (
            <div data-testid="list-item-meta">
              {avatar && <div data-testid="list-item-avatar">{avatar}</div>}
              {title && <div data-testid="list-item-title">{title}</div>}
              {description && <div data-testid="list-item-description">{description}</div>}
            </div>
          )
        }
      )
    }
  ),
  Button: ({ children }: any) => <button data-testid="button">{children}</button>,
  Typography: {
    Title: ({ children, level }: any) => (
      <h1 data-testid="title" data-level={level}>{children}</h1>
    ),
    Text: ({ children }: any) => <span data-testid="text">{children}</span>
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
  BarChartOutlined: () => <div data-testid="bar-chart-icon" />,
  PieChartOutlined: () => <div data-testid="pie-chart-icon" />,
  LineChartOutlined: () => <div data-testid="line-chart-icon" />
}))

describe('AdminIndexPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染管理员首页', () => {
    render(<AdminIndexPage />)
    
    // 检查欢迎标题
    expect(screen.getByText('欢迎回来，管理员！')).toBeInTheDocument()
    
    // 检查统计卡片数量（4个关键指标 + 4个功能卡片）
    expect(screen.getAllByTestId('card')).toHaveLength(8) // 4个指标 + 系统状态 + 快速操作 + 最近活动 + 数据概览
    
    // 检查统计数据
    expect(screen.getByText('总用户数')).toBeInTheDocument()
    expect(screen.getByText('组织数量')).toBeInTheDocument()
    expect(screen.getByText('系统配置')).toBeInTheDocument()
    expect(screen.getByText('文档数量')).toBeInTheDocument()
  })

  it('应该显示系统状态信息', () => {
    render(<AdminIndexPage />)
    
    // 检查系统状态卡片
    expect(screen.getByText('系统状态')).toBeInTheDocument()
    expect(screen.getByText('数据库连接')).toBeInTheDocument()
    expect(screen.getByText('API服务')).toBeInTheDocument()
    
    // 检查进度条
    expect(screen.getByTestId('progress')).toBeInTheDocument()
  })

  it('应该显示快速操作区域', () => {
    render(<AdminIndexPage />)
    
    // 检查快速操作卡片
    expect(screen.getByText('快速操作')).toBeInTheDocument()
    expect(screen.getByText('用户管理')).toBeInTheDocument()
    expect(screen.getByText('组织管理')).toBeInTheDocument()
    expect(screen.getByText('角色管理')).toBeInTheDocument()
    expect(screen.getByText('权限管理')).toBeInTheDocument()
  })

  it('应该显示最近活动和数据概览', () => {
    render(<AdminIndexPage />)
    
    // 检查最近活动
    expect(screen.getByText('最近活动')).toBeInTheDocument()
    expect(screen.getByTestId('list')).toBeInTheDocument()
    
    // 检查数据概览
    expect(screen.getByText('数据概览')).toBeInTheDocument()
    expect(screen.getByText('今日访问量')).toBeInTheDocument()
    expect(screen.getByText('活跃用户')).toBeInTheDocument()
    expect(screen.getByText('系统负载')).toBeInTheDocument()
  })
})

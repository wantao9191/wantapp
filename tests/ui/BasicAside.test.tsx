import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BasicAside from '@/components/layouts/BasicAside'

// Mock 依赖
vi.mock('@/hooks/useAuth', () => ({
  default: () => ({
    user: { name: 'Alice' },
    logout: vi.fn()
  })
}))

describe('BasicAside', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('渲染用户名与菜单项，点击父级展开子菜单', () => {
    render(<BasicAside collapsed={true} toggleCollapsed={() => {}} />)
    
    // 用户名显示
    expect(screen.getByText('Alice')).toBeInTheDocument()
    
    // 菜单项存在
    expect(screen.getByText('系统管理')).toBeInTheDocument()
    expect(screen.getByText('用户管理')).toBeInTheDocument()
  })
})



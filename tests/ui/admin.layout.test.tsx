import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import AdminLayout from '../../src/app/admin/layout'

// Mock Next.js navigation
const mockUsePathname = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname()
}))

// Mock BasicLayout
vi.mock('../../src/components/layouts/BasicLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="basic-layout">{children}</div>
  )
}))

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('当路径不是登录页时应该渲染BasicLayout', () => {
    mockUsePathname.mockReturnValue('/admin/users')
    
    render(
      <AdminLayout>
        <div data-testid="admin-content">Admin Content</div>
      </AdminLayout>
    )
    
    expect(screen.getByTestId('basic-layout')).toBeDefined()
    expect(screen.getByTestId('admin-content')).toBeDefined()
  })

  it('当路径是登录页时应该直接渲染children', () => {
    mockUsePathname.mockReturnValue('/admin/login')
    
    render(
      <AdminLayout>
        <div data-testid="login-content">Login Content</div>
      </AdminLayout>
    )
    
    expect(screen.queryByTestId('basic-layout')).toBeNull()
    expect(screen.getByTestId('login-content')).toBeDefined()
  })

  it('应该正确处理不同的admin路径', () => {
    mockUsePathname.mockReturnValue('/admin/system/users')
    
    render(
      <AdminLayout>
        <div data-testid="system-content">System Content</div>
      </AdminLayout>
    )
    
    expect(screen.getByTestId('basic-layout')).toBeDefined()
    expect(screen.getByTestId('system-content')).toBeDefined()
  })
})

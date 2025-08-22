import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BasicHeader from '@/components/layouts/BasicHeader'

describe('BasicHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('渲染并触发折叠/主题/刷新', () => {
    const toggleCollapsed = vi.fn()
    const toggleTheme = vi.fn()
    
    // Mock window.location.reload
    const originalReload = window.location.reload
    Object.defineProperty(window.location, 'reload', {
      value: vi.fn(),
      writable: true
    })

    render(
      <BasicHeader 
        collapsed={false} 
        toggleCollapsed={toggleCollapsed} 
        theme="light" 
        toggleTheme={toggleTheme} 
      />
    )

    // 测试折叠按钮
    const collapseBtn = screen.getByRole('button', { name: /折叠/ })
    fireEvent.click(collapseBtn)
    expect(toggleCollapsed).toHaveBeenCalled()

    // 测试主题切换
    const themeBtn = screen.getByRole('button', { name: /主题/ })
    fireEvent.click(themeBtn)
    expect(toggleTheme).toHaveBeenCalled()

    // 测试刷新按钮
    const refreshBtn = screen.getByRole('button', { name: /刷新/ })
    fireEvent.click(refreshBtn)
    expect(window.location.reload).toHaveBeenCalled()

    // 恢复原始方法
    Object.defineProperty(window.location, 'reload', {
      value: originalReload,
      writable: true
    })
  })
})



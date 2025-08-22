import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BasicTabs from '@/components/layouts/BasicTabs'

describe('BasicTabs', () => {
  it('渲染多个标签并默认激活 "关于"', () => {
    render(<BasicTabs />)
    
    // 标签文本
    expect(screen.getByText('分析页')).toBeInTheDocument()
    expect(screen.getByText('工作台')).toBeInTheDocument()
    expect(screen.getByText('关于')).toBeInTheDocument()
    
    // 默认激活"关于"标签
    const aboutTab = screen.getByText('关于')
    expect(aboutTab).toHaveClass('ant-tabs-tab-active')
  })
})



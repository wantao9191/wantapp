import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BasicLayout from '@/components/layouts/BasicLayout'

describe('BasicLayout', () => {
  it('渲染布局与子内容', () => {
    render(<BasicLayout><div>ChildContent</div></BasicLayout>)
    
    expect(screen.getByText('ChildContent')).toBeInTheDocument()
    // 验证布局结构
    expect(screen.getByTestId('basic-layout')).toBeInTheDocument()
  })
})



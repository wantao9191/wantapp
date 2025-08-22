import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import ConfigModal from '@/components/ui/ConfigModal'

describe('ConfigModal', () => {
  const mockSlots = {
    body: <div data-testid="modal-body">Modal Body Content</div>,
    footer: <div data-testid="modal-footer">Modal Footer Content</div>
  }

  it('应该正确渲染模态框', () => {
    render(<ConfigModal slots={mockSlots} />)
    
    expect(screen.getByTestId('modal-body')).toBeInTheDocument()
    expect(screen.getByTestId('modal-footer')).toBeInTheDocument()
  })

  it('应该显示正确的文本内容', () => {
    render(<ConfigModal slots={mockSlots} />)
    
    expect(screen.getByText('Modal Body Content')).toBeInTheDocument()
    expect(screen.getByText('Modal Footer Content')).toBeInTheDocument()
  })

  it('应该应用正确的样式类', () => {
    const { container } = render(<ConfigModal slots={mockSlots} />)
    
    const modalContainer = container.firstChild as HTMLElement
    expect(modalContainer).toHaveClass('relative', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200', 'h-400px')
  })

  it('应该正确设置内容区域样式', () => {
    const { container } = render(<ConfigModal slots={mockSlots} />)
    
    const bodyContainer = container.querySelector('.p-5.pb-20.overflow-y-auto.h-full')
    expect(bodyContainer).toBeInTheDocument()
  })

  it('应该正确设置底部区域样式', () => {
    const { container } = render(<ConfigModal slots={mockSlots} />)
    
    const footerContainer = container.querySelector('footer')
    expect(footerContainer).toHaveClass('absolute', 'bottom-0', 'left-0', 'right-0', 'pt-4', 'bg-white', 'border-t', 'border-gray-100')
  })

  it('应该正确设置底部按钮容器样式', () => {
    const { container } = render(<ConfigModal slots={mockSlots} />)
    
    const buttonContainer = container.querySelector('.flex.justify-end.gap-3')
    expect(buttonContainer).toBeInTheDocument()
  })

  it('应该支持复杂的子组件内容', () => {
    const complexSlots = {
      body: (
        <div>
          <h1 data-testid="title">标题</h1>
          <p data-testid="description">描述文本</p>
          <button data-testid="action-button">操作按钮</button>
        </div>
      ),
      footer: (
        <div>
          <button data-testid="cancel-button">取消</button>
          <button data-testid="confirm-button">确认</button>
        </div>
      )
    }
    
    render(<ConfigModal slots={complexSlots} />)
    
    expect(screen.getByTestId('title')).toBeInTheDocument()
    expect(screen.getByTestId('description')).toBeInTheDocument()
    expect(screen.getByTestId('action-button')).toBeInTheDocument()
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-button')).toBeInTheDocument()
  })

  it('应该支持空内容', () => {
    const emptySlots = {
      body: null,
      footer: null
    }
    
    const { container } = render(<ConfigModal slots={emptySlots} />)
    
    // 模态框容器应该仍然存在
    expect(container.firstChild).toBeInTheDocument()
  })

  it('应该支持函数组件作为子组件', () => {
    const TestComponent = () => <div data-testid="test-component">测试组件</div>
    
    const functionSlots = {
      body: <TestComponent />,
      footer: <div>底部</div>
    }
    
    render(<ConfigModal slots={functionSlots} />)
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText('测试组件')).toBeInTheDocument()
    expect(screen.getByText('底部')).toBeInTheDocument()
  })

  it('应该保持正确的 DOM 结构', () => {
    const { container } = render(<ConfigModal slots={mockSlots} />)
    
    const modalContainer = container.firstChild as HTMLElement
    const bodyContainer = modalContainer.querySelector('.p-5.pb-20.overflow-y-auto.h-full')
    const footerContainer = modalContainer.querySelector('footer')
    const buttonContainer = footerContainer?.querySelector('.flex.justify-end.gap-3')
    
    expect(modalContainer).toBeInTheDocument()
    expect(bodyContainer).toBeInTheDocument()
    expect(footerContainer).toBeInTheDocument()
    expect(buttonContainer).toBeInTheDocument()
  })
})

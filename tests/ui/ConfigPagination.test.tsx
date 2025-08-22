import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfigPagination from '@/components/ui/ConfigPagination'

describe('ConfigPagination', () => {
  const defaultProps = {
    current: 1,
    pageSize: 10,
    total: 100
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染分页组件', () => {
    render(<ConfigPagination {...defaultProps} />)
    
    // 检查分页组件是否存在
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('应该显示正确的页码信息', () => {
    render(<ConfigPagination {...defaultProps} />)
    
    // 检查当前页码
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('应该显示总数信息', () => {
    render(<ConfigPagination {...defaultProps} />)
    
    // 检查总数显示
    expect(screen.getByText('共 100 条')).toBeInTheDocument()
  })

  it('应该处理总数为0的情况', () => {
    render(<ConfigPagination {...defaultProps} total={0} />)
    
    expect(screen.getByText('暂无数据')).toBeInTheDocument()
  })

  it('应该支持自定义总数显示函数', () => {
    const customShowTotal = (total: number, range: [number, number]) => 
      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
    
    render(
      <ConfigPagination 
        {...defaultProps} 
        showTotal={customShowTotal}
      />
    )
    
    expect(screen.getByText('第 1-10 条，共 100 条')).toBeInTheDocument()
  })

  it('应该支持隐藏总数显示', () => {
    render(<ConfigPagination {...defaultProps} showTotal={false} />)
    
    expect(screen.queryByText('共 100 条')).not.toBeInTheDocument()
  })

  it('应该支持自定义页面大小选项', () => {
    const customPageSizeOptions = ['5', '15', '25', '50']
    
    render(
      <ConfigPagination 
        {...defaultProps} 
        pageSizeOptions={customPageSizeOptions}
      />
    )
    
    // 检查页面大小选择器是否存在
    const sizeChanger = screen.getByRole('combobox')
    expect(sizeChanger).toBeInTheDocument()
  })

  it('应该支持隐藏页面大小选择器', () => {
    render(<ConfigPagination {...defaultProps} showSizeChanger={false} />)
    
    const sizeChanger = screen.queryByRole('combobox')
    expect(sizeChanger).not.toBeInTheDocument()
  })

  it('应该支持隐藏快速跳转', () => {
    render(<ConfigPagination {...defaultProps} showQuickJumper={false} />)
    
    // 快速跳转输入框应该不存在
    const quickJumper = document.querySelector('.ant-pagination-options-quick-jumper')
    expect(quickJumper).not.toBeInTheDocument()
  })

  it('应该支持不同的尺寸', () => {
    const { rerender } = render(<ConfigPagination {...defaultProps} size="small" />)
    
    let pagination = document.querySelector('.ant-pagination')
    expect(pagination).toHaveClass('ant-pagination-mini')
    
    rerender(<ConfigPagination {...defaultProps} size="default" />)
    pagination = document.querySelector('.ant-pagination')
    expect(pagination).not.toHaveClass('ant-pagination-mini')
  })

  it('应该支持自定义样式和类名', () => {
    const { container } = render(
      <ConfigPagination 
        {...defaultProps} 
        className="custom-pagination"
        style={{ backgroundColor: 'red' }}
      />
    )
    
    const paginationContainer = container.firstChild as HTMLElement
    expect(paginationContainer).toHaveClass('custom-pagination')
    expect(paginationContainer).toHaveStyle({ backgroundColor: 'red' })
  })

  it('应该支持不同的对齐方式', () => {
    const { container, rerender } = render(
      <ConfigPagination {...defaultProps} align="left" />
    )
    
    let paginationContainer = container.firstChild as HTMLElement
    expect(paginationContainer).toHaveClass('flex', 'justify-start')
    
    rerender(<ConfigPagination {...defaultProps} align="center" />)
    paginationContainer = container.firstChild as HTMLElement
    expect(paginationContainer).toHaveClass('flex', 'justify-center')
    
    rerender(<ConfigPagination {...defaultProps} align="right" />)
    paginationContainer = container.firstChild as HTMLElement
    expect(paginationContainer).toHaveClass('flex', 'justify-end')
  })

  it('应该调用 onChange 回调', () => {
    const onChange = vi.fn()
    
    render(<ConfigPagination {...defaultProps} onChange={onChange} />)
    
    // 点击下一页
    const nextButton = screen.getByRole('button', { name: /下一页/ })
    fireEvent.click(nextButton)
    
    expect(onChange).toHaveBeenCalledWith(2, 10)
  })

  it('应该调用 onShowSizeChange 回调', () => {
    const onShowSizeChange = vi.fn()
    
    render(
      <ConfigPagination 
        {...defaultProps} 
        onShowSizeChange={onShowSizeChange}
      />
    )
    
    // 改变页面大小
    const sizeChanger = screen.getByRole('combobox')
    fireEvent.change(sizeChanger, { target: { value: '20' } })
    
    expect(onShowSizeChange).toHaveBeenCalledWith(1, 20)
  })

  it('应该支持中文本地化', () => {
    render(<ConfigPagination {...defaultProps} />)
    
    // 检查中文本地化文本
    expect(screen.getByText('条/页')).toBeInTheDocument()
    expect(screen.getByText('跳至')).toBeInTheDocument()
    expect(screen.getByText('确定')).toBeInTheDocument()
    expect(screen.getByText('页')).toBeInTheDocument()
  })

  it('应该正确处理边界情况', () => {
    // 测试总数为1的情况
    render(<ConfigPagination {...defaultProps} total={1} />)
    
    expect(screen.getByText('共 1 条')).toBeInTheDocument()
    
    // 测试当前页大于总页数的情况
    render(<ConfigPagination {...defaultProps} current={15} />)
    
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('应该支持自定义样式属性', () => {
    const customStyle = {
      marginTop: '20px',
      padding: '10px'
    }
    
    const { container } = render(
      <ConfigPagination 
        {...defaultProps} 
        style={customStyle}
      />
    )
    
    const paginationContainer = container.firstChild as HTMLElement
    expect(paginationContainer).toHaveStyle(customStyle)
  })
})

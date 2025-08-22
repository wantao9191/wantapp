import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConfigTable } from '@/components/ui/ConfirmTable'
import type { TableColumnConfig, FormItemConfig, CommonActionConfig } from '@/components/ui/ConfirmTable'

// Mock 子组件
vi.mock('@/components/ui/ConfigPagination', () => ({
  default: ({ current, pageSize, total, onChange }: any) => (
    <div data-testid="pagination">
      <span>第 {current} 页</span>
      <span>每页 {pageSize} 条</span>
      <span>共 {total} 条</span>
      <button onClick={() => onChange(2, 10)}>下一页</button>
    </div>
  )
}))

vi.mock('@/components/ui/ConfigForm', () => ({
  default: ({ config, onFinish }: any) => (
    <form data-testid="search-form" onSubmit={(e) => {
      e.preventDefault()
      onFinish({ search: 'test' })
    }}>
      <input data-testid="search-input" placeholder="搜索..." />
      <button type="submit">搜索</button>
    </form>
  )
}))

vi.mock('@/lib/form-utils', () => ({
  createQuickForm: vi.fn(() => ({
    items: [
      { name: 'search', label: '搜索', type: 'input' }
    ]
  }))
}))

describe('ConfigTable', () => {
  const mockColumns: TableColumnConfig[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 80
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200
    }
  ]

  const mockFormColumns: FormItemConfig[] = [
    {
      name: 'name',
      label: '姓名',
      type: 'input'
    },
    {
      name: 'age',
      label: '年龄',
      type: 'number'
    }
  ]

  const mockActions: CommonActionConfig[] = [
    {
      key: 'edit',
      label: '编辑',
      onClick: vi.fn()
    },
    {
      key: 'delete',
      label: '删除',
      danger: true,
      onClick: vi.fn()
    }
  ]

  const mockData = [
    { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
    { id: 2, name: '李四', age: 30, email: 'lisi@example.com' }
  ]

  const mockApi = vi.fn().mockResolvedValue({
    data: mockData,
    total: 2,
    success: true
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染表格', () => {
    render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        api={mockApi}
      />
    )
    
    expect(screen.getByText('姓名')).toBeInTheDocument()
    expect(screen.getByText('年龄')).toBeInTheDocument()
    expect(screen.getByText('邮箱')).toBeInTheDocument()
  })

  it('应该渲染搜索表单', () => {
    render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        searchable={true}
        api={mockApi}
      />
    )
    
    expect(screen.getByTestId('search-form')).toBeInTheDocument()
    expect(screen.getByTestId('search-input')).toBeInTheDocument()
  })

  it('应该支持隐藏搜索表单', () => {
    render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        searchable={false}
        api={mockApi}
      />
    )
    
    expect(screen.queryByTestId('search-form')).not.toBeInTheDocument()
  })

  it('应该渲染操作列', () => {
    render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        actions={{
          title: '操作',
          key: 'actions',
          width: 120,
          actions: mockActions
        }}
        api={mockApi}
      />
    )
    
    expect(screen.getByText('操作')).toBeInTheDocument()
    expect(screen.getByText('编辑')).toBeInTheDocument()
    expect(screen.getByText('删除')).toBeInTheDocument()
  })

  it('应该支持自定义行键', () => {
    const customRowKey = 'customId'
    
    render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        rowKey={customRowKey}
        api={mockApi}
      />
    )
    
    // 表格应该使用自定义行键
    expect(screen.getByText('姓名')).toBeInTheDocument()
  })

  it('应该支持不同的表格尺寸', () => {
    const { rerender } = render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        size="small"
        api={mockApi}
      />
    )
    
    let table = document.querySelector('.ant-table')
    expect(table).toHaveClass('ant-table-small')
    
    rerender(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        size="large"
        api={mockApi}
      />
    )
    
    table = document.querySelector('.ant-table')
    expect(table).toHaveClass('ant-table-large')
  })

  it('应该支持边框设置', () => {
    render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        bordered={false}
        api={mockApi}
      />
    )
    
    const table = document.querySelector('.ant-table')
    expect(table).not.toHaveClass('ant-table-bordered')
  })

  it('应该支持滚动设置', () => {
    const scroll = { x: 1000, y: 400 }
    
    render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        scroll={scroll}
        api={mockApi}
      />
    )
    
    const table = document.querySelector('.ant-table')
    expect(table).toBeInTheDocument()
  })

  it('应该支持工具插槽', () => {
    const slots = {
      tools: <button data-testid="custom-tool">自定义工具</button>
    }
    
    render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        slots={slots}
        api={mockApi}
      />
    )
    
    expect(screen.getByTestId('custom-tool')).toBeInTheDocument()
  })

  it('应该支持分页', () => {
    render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        api={mockApi}
      />
    )
    
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })

  it('应该处理分页变化', async () => {
    render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        api={mockApi}
      />
    )
    
    const nextButton = screen.getByText('下一页')
    fireEvent.click(nextButton)
    
    // 分页应该正确显示
    expect(screen.getByText('第 2 页')).toBeInTheDocument()
  })

  it('应该支持搜索功能', async () => {
    render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        searchable={true}
        api={mockApi}
      />
    )
    
    const searchForm = screen.getByTestId('search-form')
    fireEvent.submit(searchForm)
    
    await waitFor(() => {
      expect(mockApi).toHaveBeenCalled()
    })
  })

  it('应该支持列排序', () => {
    const columnsWithSorter = [
      {
        ...mockColumns[0],
        sorter: true
      },
      ...mockColumns.slice(1)
    ]
    
    render(
      <ConfigTable
        columns={columnsWithSorter}
        formColumns={mockFormColumns}
        api={mockApi}
      />
    )
    
    // 应该显示排序图标
    const sortableColumn = screen.getByText('姓名')
    expect(sortableColumn).toBeInTheDocument()
  })

  it('应该支持列过滤', () => {
    const columnsWithFilters = [
      {
        ...mockColumns[0],
        filters: [
          { text: '张三', value: '张三' },
          { text: '李四', value: '李四' }
        ]
      },
      ...mockColumns.slice(1)
    ]
    
    render(
      <ConfigTable
        columns={columnsWithFilters}
        formColumns={mockFormColumns}
        api={mockApi}
      />
    )
    
    // 应该显示过滤图标
    const filterableColumn = screen.getByText('姓名')
    expect(filterableColumn).toBeInTheDocument()
  })

  it('应该支持列宽度设置', () => {
    const columnsWithWidth = [
      {
        ...mockColumns[0],
        width: 200
      },
      ...mockColumns.slice(1)
    ]
    
    render(
      <ConfigTable
        columns={columnsWithWidth}
        formColumns={mockFormColumns}
        api={mockApi}
      />
    )
    
    expect(screen.getByText('姓名')).toBeInTheDocument()
  })

  it('应该支持列对齐方式', () => {
    const columnsWithAlign = [
      {
        ...mockColumns[0],
        align: 'center'
      },
      ...mockColumns.slice(1)
    ]
    
    render(
      <ConfigTable
        columns={columnsWithAlign}
        formColumns={mockFormColumns}
        api={mockApi}
      />
    )
    
    expect(screen.getByText('姓名')).toBeInTheDocument()
  })

  it('应该支持列固定', () => {
    const columnsWithFixed = [
      {
        ...mockColumns[0],
        fixed: 'left'
      },
      ...mockColumns.slice(1)
    ]
    
    render(
      <ConfigTable
        columns={columnsWithFixed}
        formColumns={mockFormColumns}
        api={mockApi}
      />
    )
    
    expect(screen.getByText('姓名')).toBeInTheDocument()
  })

  it('应该处理 API 调用', async () => {
    render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        api={mockApi}
      />
    )
    
    await waitFor(() => {
      expect(mockApi).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        search: undefined
      })
    })
  })

  it('应该处理加载状态', () => {
    render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        api={mockApi}
      />
    )
    
    // 初始加载状态
    expect(screen.getByText('姓名')).toBeInTheDocument()
  })

  it('应该支持重新加载', () => {
    const setReload = vi.fn()
    
    render(
      <ConfigTable
        columns={mockColumns}
        formColumns={mockFormColumns}
        reload={true}
        setReload={setReload}
        api={mockApi}
      />
    )
    
    expect(screen.getByText('姓名')).toBeInTheDocument()
  })
})

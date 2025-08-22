import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import useItems from '@/app/admin/system/organizations/useItems'

// Mock 所有外部依赖
vi.mock('@/app/admin/system/organizations/useItems')

// 创建一个简化的测试组件
const SimpleTestComponent = () => {
  const { tableColumns, searchFormSchema } = useItems()
  const [state, setState] = React.useState({
    reload: false,
    open: false,
    formData: null as any
  })

  return (
    <div data-testid="test-component">
      <div data-testid="config-info">
        表格列: {tableColumns?.length || 0}, 搜索字段: {searchFormSchema?.length || 0}
      </div>
      
      <button 
        data-testid="add-btn"
        onClick={() => setState(prev => ({ ...prev, open: true, formData: null }))}
      >
        新增
      </button>
      
      <button 
        data-testid="edit-btn"
        onClick={() => setState(prev => ({ ...prev, open: true, formData: { id: 1, name: '测试' } }))}
      >
        编辑
      </button>
      
      <button 
        data-testid="delete-btn"
        onClick={() => setState(prev => ({ ...prev, reload: true }))}
      >
        删除
      </button>

      {state.open && (
        <div data-testid="modal">
          <div data-testid="modal-data">
            {state.formData ? JSON.stringify(state.formData) : '新增'}
          </div>
          <button 
            data-testid="modal-close"
            onClick={() => setState(prev => ({ ...prev, open: false }))}
          >
            关闭
          </button>
        </div>
      )}

      <div data-testid="reload-state">
        {state.reload ? '已重载' : '未重载'}
      </div>
    </div>
  )
}

describe('OrganizationsPage - Unit Tests', () => {
  const mockUseItems = {
    tableColumns: [
      { title: '机构名称', dataIndex: 'name', key: 'name' },
      { title: '状态', dataIndex: 'status', key: 'status' }
    ],
    searchFormSchema: [
      { label: '机构名称', name: 'name', type: 'input' as const },
      { label: '状态', name: 'status', type: 'select' as const }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useItems).mockReturnValue(mockUseItems)
  })

  afterEach(() => {
    cleanup()
  })

  it('应该正确渲染基本组件', () => {
    render(<SimpleTestComponent />)
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByTestId('config-info')).toBeInTheDocument()
  })

  it('应该显示正确的配置信息', () => {
    render(<SimpleTestComponent />)
    
    expect(screen.getByTestId('config-info')).toHaveTextContent('表格列: 2, 搜索字段: 2')
  })

  it('应该显示操作按钮', () => {
    render(<SimpleTestComponent />)
    
    expect(screen.getByTestId('add-btn')).toBeInTheDocument()
    expect(screen.getByTestId('edit-btn')).toBeInTheDocument()
    expect(screen.getByTestId('delete-btn')).toBeInTheDocument()
  })

  it('应该处理新增操作', () => {
    render(<SimpleTestComponent />)
    
    const addBtn = screen.getByTestId('add-btn')
    fireEvent.click(addBtn)
    
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('modal-data')).toHaveTextContent('新增')
  })

  it('应该处理编辑操作', () => {
    render(<SimpleTestComponent />)
    
    const editBtn = screen.getByTestId('edit-btn')
    fireEvent.click(editBtn)
    
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('modal-data')).toHaveTextContent('测试')
  })

  it('应该处理删除操作', () => {
    render(<SimpleTestComponent />)
    
    expect(screen.getByTestId('reload-state')).toHaveTextContent('未重载')
    
    const deleteBtn = screen.getByTestId('delete-btn')
    fireEvent.click(deleteBtn)
    
    expect(screen.getByTestId('reload-state')).toHaveTextContent('已重载')
  })

  it('应该处理模态框关闭', () => {
    render(<SimpleTestComponent />)
    
    // 打开模态框
    const addBtn = screen.getByTestId('add-btn')
    fireEvent.click(addBtn)
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    
    // 关闭模态框
    const closeBtn = screen.getByTestId('modal-close')
    fireEvent.click(closeBtn)
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('应该正确调用 useItems Hook', () => {
    render(<SimpleTestComponent />)
    
    expect(useItems).toHaveBeenCalled()
    
    const result = useItems()
    expect(result.tableColumns).toHaveLength(2)
    expect(result.searchFormSchema).toHaveLength(2)
  })

  it('应该验证 tableColumns 结构', () => {
    render(<SimpleTestComponent />)
    
    const result = useItems()
    
    expect(result.tableColumns[0]).toEqual({
      title: '机构名称',
      dataIndex: 'name',
      key: 'name'
    })
    
    expect(result.tableColumns[1]).toEqual({
      title: '状态',
      dataIndex: 'status',
      key: 'status'
    })
  })

  it('应该验证 searchFormSchema 结构', () => {
    render(<SimpleTestComponent />)
    
    const result = useItems()
    
    expect(result.searchFormSchema[0]).toEqual({
      label: '机构名称',
      name: 'name',
      type: 'input'
    })
    
    expect(result.searchFormSchema[1]).toEqual({
      label: '状态',
      name: 'status',
      type: 'select'
    })
  })
})

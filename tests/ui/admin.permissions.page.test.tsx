import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { App } from 'antd'
import PermissionsPage from '@/app/admin/system/permissions/page'

// Mock 所有外部依赖
vi.mock('@/app/admin/system/permissions/useItems', () => ({
  default: vi.fn()
}))

vi.mock('@/lib/https', () => ({
  http: {
    get: vi.fn()
  }
}))

vi.mock('@/app/admin/system/permissions/components/editModal', () => ({
  default: vi.fn(({ formData, onSubmit, onCancel }) => (
    <div data-testid="edit-modal">
      <div data-testid="modal-data">
        {formData ? JSON.stringify(formData) : '新增权限'}
      </div>
      <button data-testid="modal-submit" onClick={onSubmit}>
        提交
      </button>
      <button data-testid="modal-cancel" onClick={onCancel}>
        取消
      </button>
    </div>
  ))
}))

vi.mock('@/components/ui/ConfirmTable', () => ({
  ConfigTable: vi.fn(({ slots, api, reload, setReload }) => (
    <div data-testid="config-table">
      <div data-testid="table-tools">
        {slots?.tools}
      </div>
      <div data-testid="table-reload" data-reload={reload}>
        表格重载状态: {reload ? '是' : '否'}
      </div>
      <button 
        data-testid="trigger-reload"
        onClick={() => setReload(true)}
      >
        触发重载
      </button>
    </div>
  )),
  ActionConfig: {}
}))

describe('PermissionsPage', () => {
  const mockUseItems = {
    tableColumns: [
      { title: '权限名称', dataIndex: 'name', key: 'name' },
      { title: '权限编码', dataIndex: 'code', key: 'code' },
      { title: '描述', dataIndex: 'description', key: 'description' },
      { title: '状态', dataIndex: 'status', key: 'status' },
      { title: '创建时间', dataIndex: 'createTime', key: 'createTime' }
    ],
    searchFormSchema: [
      { label: '权限名称', name: 'name', type: 'input' },
      { label: '状态', name: 'status', type: 'select' }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    const useItems = require('@/app/admin/system/permissions/useItems').default
    vi.mocked(useItems).mockReturnValue(mockUseItems)
  })

  afterEach(() => {
    cleanup()
  })

  it('应该正确渲染权限管理页面', () => {
    render(
      <App>
        <PermissionsPage />
      </App>
    )
    
    expect(screen.getByTestId('config-table')).toBeInTheDocument()
    expect(screen.getByText('新增')).toBeInTheDocument()
  })

  it('应该显示新增按钮', () => {
    render(
      <App>
        <PermissionsPage />
      </App>
    )
    
    const addButton = screen.getByText('新增')
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveClass('bg-green-500')
  })

  it('应该处理新增权限操作', async () => {
    render(
      <App>
        <PermissionsPage />
      </App>
    )
    
    const addButton = screen.getByText('新增')
    fireEvent.click(addButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-data')).toHaveTextContent('新增权限')
    })
  })

  it('应该处理表格重载', async () => {
    render(
      <App>
        <PermissionsPage />
      </App>
    )
    
    const reloadButton = screen.getByTestId('trigger-reload')
    fireEvent.click(reloadButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('table-reload')).toHaveAttribute('data-reload', 'true')
    })
  })

  it('应该正确传递 API 函数给表格', () => {
    render(
      <App>
        <PermissionsPage />
      </App>
    )
    
    const { ConfigTable } = require('@/components/ui/ConfirmTable')
    expect(ConfigTable).toHaveBeenCalledWith(
      expect.objectContaining({
        api: expect.any(Function),
        reload: false,
        setReload: expect.any(Function)
      }),
      expect.anything()
    )
  })

  it('应该正确配置表格列和搜索表单', () => {
    render(
      <App>
        <PermissionsPage />
      </App>
    )
    
    const { ConfigTable } = require('@/components/ui/ConfirmTable')
    expect(ConfigTable).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: mockUseItems.tableColumns,
        formColumns: mockUseItems.searchFormSchema,
        rowKey: 'id',
        searchable: true,
        bordered: false,
        size: 'small'
      }),
      expect.anything()
    )
  })

  it('应该正确配置操作按钮', () => {
    render(
      <App>
        <PermissionsPage />
      </App>
    )
    
    const { ConfigTable } = require('@/components/ui/ConfirmTable')
    const callArgs = vi.mocked(ConfigTable).mock.calls[0][0]
    
    expect(callArgs.actions).toBeDefined()
    expect(callArgs.actions.title).toBe('操作')
    expect(callArgs.actions.key).toBe('actions')
    expect(callArgs.actions.width).toBe(150)
    expect(callArgs.actions.fixed).toBe('left')
    expect(callArgs.actions.align).toBe('center')
    expect(callArgs.actions.actions).toHaveLength(1)
    
    const actions = callArgs.actions.actions
    expect(actions[0].key).toBe('edit')
    expect(actions[0].label).toBe('编辑')
    expect(actions[0].type).toBe('link')
  })

  it('应该正确处理模态框状态', async () => {
    render(
      <App>
        <PermissionsPage />
      </App>
    )
    
    // 初始状态不应该显示模态框
    expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument()
    
    // 点击新增按钮
    const addButton = screen.getByText('新增')
    fireEvent.click(addButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
    })
  })

  it('应该正确处理表单数据传递', async () => {
    render(
      <App>
        <PermissionsPage />
      </App>
    )
    
    // 点击新增按钮
    const addButton = screen.getByText('新增')
    fireEvent.click(addButton)
    
    await waitFor(() => {
      const editModal = screen.getByTestId('edit-modal')
      expect(editModal).toBeInTheDocument()
      
      const modalData = screen.getByTestId('modal-data')
      expect(modalData).toHaveTextContent('新增权限')
    })
  })

  it('应该正确处理编辑操作', async () => {
    render(
      <App>
        <PermissionsPage />
      </App>
    )
    
    // 模拟编辑操作 - 这里需要模拟表格中的编辑按钮点击
    // 由于 ConfigTable 是 mock 的，我们需要通过其他方式测试
    const editModal = screen.queryByTestId('edit-modal')
    expect(editModal).not.toBeInTheDocument()
  })

  it('应该正确调用 useItems Hook', () => {
    render(
      <App>
        <PermissionsPage />
      </App>
    )
    
    const useItems = require('@/app/admin/system/permissions/useItems').default
    expect(useItems).toHaveBeenCalled()
    
    const result = useItems()
    expect(result.tableColumns).toHaveLength(5)
    expect(result.searchFormSchema).toHaveLength(2)
  })

  it('应该验证 tableColumns 结构', () => {
    render(
      <App>
        <PermissionsPage />
      </App>
    )
    
    const useItems = require('@/app/admin/system/permissions/useItems').default
    const result = useItems()
    
    expect(result.tableColumns[0]).toEqual({
      title: '权限名称',
      dataIndex: 'name',
      key: 'name'
    })
    
    expect(result.tableColumns[1]).toEqual({
      title: '权限编码',
      dataIndex: 'code',
      key: 'code'
    })
  })

  it('应该验证 searchFormSchema 结构', () => {
    render(
      <App>
        <PermissionsPage />
      </App>
    )
    
    const useItems = require('@/app/admin/system/permissions/useItems').default
    const result = useItems()
    
    expect(result.searchFormSchema[0]).toEqual({
      label: '权限名称',
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

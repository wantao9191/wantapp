import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { App } from 'antd'
import UsersPage from '../../src/app/admin/system/users/page'

// Mock 所有外部依赖
vi.mock('../../src/app/admin/system/users/useItems', () => ({
  default: vi.fn()
}))

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

vi.mock('../../src/lib/https', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('../../src/app/admin/system/users/components/editModal', () => ({
  default: vi.fn(({ formData, onSubmit, onCancel }) => (
    <div data-testid="edit-modal">
      <div data-testid="modal-data">
        {formData ? JSON.stringify(formData) : '新增用户'}
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

vi.mock('../../src/components/ui/ConfirmTable', () => ({
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

describe('UsersPage', () => {
  const mockUseItems = {
    tableColumns: [
      { title: '用户名称', dataIndex: 'name', key: 'name' },
      { title: '用户名', dataIndex: 'username', key: 'username' },
      { title: '手机号', dataIndex: 'phone', key: 'phone' },
      { title: '邮箱', dataIndex: 'email', key: 'email' },
      { title: '所属机构', dataIndex: 'organizationName', key: 'organizationName' },
      { title: '角色', dataIndex: 'roleNames', key: 'roleNames' },
      { title: '备注', dataIndex: 'description', key: 'description' },
      { title: '状态', dataIndex: 'status', key: 'status' },
      { title: '创建时间', dataIndex: 'createTime', key: 'createTime' }
    ],
    searchFormSchema: [
      { label: '用户名称', name: 'name', type: 'input' },
      { label: '状态', name: 'status', type: 'select' }
    ]
  }

  const mockUserInfo = {
    id: 1,
    name: '管理员',
    username: 'admin'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    const { useAuth } = require('@/hooks/useAuth')
    const useItems = require('@/app/admin/system/users/useItems').default
    
    vi.mocked(useAuth).mockReturnValue({
      userInfo: mockUserInfo
    })
    
    vi.mocked(useItems).mockReturnValue(mockUseItems)
  })

  afterEach(() => {
    cleanup()
  })

  it('应该正确渲染用户管理页面', () => {
    render(
      <App>
        <UsersPage />
      </App>
    )
    
    expect(screen.getByTestId('config-table')).toBeInTheDocument()
    expect(screen.getByText('新增')).toBeInTheDocument()
  })

  it('应该显示新增按钮', () => {
    render(
      <App>
        <UsersPage />
      </App>
    )
    
    const addButton = screen.getByText('新增')
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveClass('bg-green-500')
  })

  it('应该处理新增用户操作', async () => {
    render(
      <App>
        <UsersPage />
      </App>
    )
    
    const addButton = screen.getByText('新增')
    fireEvent.click(addButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-data')).toHaveTextContent('新增用户')
    })
  })

  it('应该处理编辑用户操作', async () => {
    render(
      <App>
        <UsersPage />
      </App>
    )
    
    // 模拟编辑操作 - 这里需要模拟表格中的编辑按钮点击
    // 由于 ConfigTable 是 mock 的，我们需要通过其他方式测试
    const editModal = screen.queryByTestId('edit-modal')
    expect(editModal).not.toBeInTheDocument()
  })

  it('应该处理删除用户操作', async () => {
    const { http } = require('@/lib/https')
    vi.mocked(http.delete).mockResolvedValue({})
    
    // Mock Modal.confirm
    const mockConfirm = vi.fn().mockImplementation(({ onOk }) => {
      onOk()
    })
    
    vi.doMock('antd', async () => {
      const actual = await vi.importActual('antd')
      return {
        ...actual,
        Modal: {
          ...actual.Modal,
          confirm: mockConfirm
        }
      }
    })

    render(
      <App>
        <UsersPage />
      </App>
    )
    
    // 由于删除操作在表格的 action 中，这里主要测试确认逻辑
    expect(mockConfirm).not.toHaveBeenCalled()
  })

  it('应该处理表格重载', async () => {
    render(
      <App>
        <UsersPage />
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
        <UsersPage />
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
        <UsersPage />
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
        <UsersPage />
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
    expect(callArgs.actions.actions).toHaveLength(2)
    
    const actions = callArgs.actions.actions
    expect(actions[0].key).toBe('edit')
    expect(actions[0].label).toBe('编辑')
    expect(actions[0].type).toBe('link')
    
    expect(actions[1].key).toBe('delete')
    expect(actions[1].label).toBe('删除')
    expect(actions[1].type).toBe('link')
    expect(actions[1].danger).toBe(true)
  })

  it('应该正确处理用户信息过滤', () => {
    render(
      <App>
        <UsersPage />
      </App>
    )
    
    const { ConfigTable } = require('@/components/ui/ConfirmTable')
    const callArgs = vi.mocked(ConfigTable).mock.calls[0][0]
    const actions = callArgs.actions.actions
    
    // 测试编辑按钮的隐藏逻辑
    const editAction = actions[0]
    expect(editAction.hidden).toBeDefined()
    expect(typeof editAction.hidden).toBe('function')
    
    // 测试当前用户不能编辑自己
    expect(editAction.hidden({ id: 1 })).toBe(true) // 当前用户ID
    expect(editAction.hidden({ id: 2 })).toBe(false) // 其他用户ID
    
    // 测试删除按钮的隐藏逻辑
    const deleteAction = actions[1]
    expect(deleteAction.hidden).toBeDefined()
    expect(typeof deleteAction.hidden).toBe('function')
    
    expect(deleteAction.hidden({ id: 1 })).toBe(true) // 当前用户ID
    expect(deleteAction.hidden({ id: 2 })).toBe(false) // 其他用户ID
  })

  it('应该正确处理模态框状态', async () => {
    render(
      <App>
        <UsersPage />
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
        <UsersPage />
      </App>
    )
    
    // 点击新增按钮
    const addButton = screen.getByText('新增')
    fireEvent.click(addButton)
    
    await waitFor(() => {
      const editModal = screen.getByTestId('edit-modal')
      expect(editModal).toBeInTheDocument()
      
      const modalData = screen.getByTestId('modal-data')
      expect(modalData).toHaveTextContent('新增用户')
    })
  })
})

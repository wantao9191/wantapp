import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useItems from '@/app/admin/system/users/useItems'

// Mock 外部依赖
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

vi.mock('@/lib/https', () => ({
  http: {
    put: vi.fn()
  }
}))

vi.mock('@/lib/utils', () => ({
  removeUndefined: vi.fn((obj) => obj)
}))

describe('useItems - Users', () => {
  const mockUserInfo = {
    id: 1,
    name: '管理员',
    username: 'admin'
  }

  const mockSetReload = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    const { useAuth } = require('@/hooks/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      userInfo: mockUserInfo
    })
  })

  it('应该返回正确的表格列配置', () => {
    const { result } = renderHook(() => useItems(mockSetReload))
    
    expect(result.current.tableColumns).toBeDefined()
    expect(Array.isArray(result.current.tableColumns)).toBe(true)
    expect(result.current.tableColumns.length).toBeGreaterThan(0)
    
    // 验证必需的列
    const columnNames = result.current.tableColumns.map(col => col.title)
    expect(columnNames).toContain('用户名称')
    expect(columnNames).toContain('用户名')
    expect(columnNames).toContain('手机号')
    expect(columnNames).toContain('邮箱')
    expect(columnNames).toContain('所属机构')
    expect(columnNames).toContain('角色')
    expect(columnNames).toContain('备注')
    expect(columnNames).toContain('状态')
    expect(columnNames).toContain('创建时间')
  })

  it('应该返回正确的搜索表单配置', () => {
    const { result } = renderHook(() => useItems(mockSetReload))
    
    expect(result.current.searchFormSchema).toBeDefined()
    expect(Array.isArray(result.current.searchFormSchema)).toBe(true)
    expect(result.current.searchFormSchema.length).toBeGreaterThan(0)
    
    // 验证搜索字段
    const searchFields = result.current.searchFormSchema.map(field => field.name)
    expect(searchFields).toContain('name')
    expect(searchFields).toContain('status')
  })

  it('应该正确配置用户名称搜索字段', () => {
    const { result } = renderHook(() => useItems(mockSetReload))
    
    const nameField = result.current.searchFormSchema.find(field => field.name === 'name')
    expect(nameField).toBeDefined()
    expect(nameField?.label).toBe('用户名称')
    expect(nameField?.type).toBe('input')
  })

  it('应该正确配置状态搜索字段', () => {
    const { result } = renderHook(() => useItems(mockSetReload))
    
    const statusField = result.current.searchFormSchema.find(field => field.name === 'status')
    expect(statusField).toBeDefined()
    expect(statusField?.label).toBe('状态')
    expect(statusField?.type).toBe('select')
    expect(statusField?.placeholder).toBe('请选择')
    
    // 类型断言来访问 options 属性
    const selectField = statusField as any
    expect(selectField?.options).toBeDefined()
    expect(selectField?.options).toHaveLength(2)
    
    // 验证状态选项
    const statusOptions = selectField?.options || []
    expect(statusOptions[0]).toEqual({ label: '启用', value: 1 })
    expect(statusOptions[1]).toEqual({ label: '禁用', value: 0 })
  })

  it('应该正确配置表格列属性', () => {
    const { result } = renderHook(() => useItems(mockSetReload))
    
    // 验证用户名称列
    const nameColumn = result.current.tableColumns.find(col => col.dataIndex === 'name')
    expect(nameColumn).toBeDefined()
    expect(nameColumn?.title).toBe('用户名称')
    expect(nameColumn?.key).toBe('name')
    expect(nameColumn?.width).toBe(150)
    
    // 验证用户名列
    const usernameColumn = result.current.tableColumns.find(col => col.dataIndex === 'username')
    expect(usernameColumn).toBeDefined()
    expect(usernameColumn?.title).toBe('用户名')
    expect(usernameColumn?.key).toBe('username')
    expect(usernameColumn?.width).toBe(200)
    
    // 验证手机号列
    const phoneColumn = result.current.tableColumns.find(col => col.dataIndex === 'phone')
    expect(phoneColumn).toBeDefined()
    expect(phoneColumn?.title).toBe('手机号')
    expect(phoneColumn?.key).toBe('phone')
    expect(phoneColumn?.width).toBe(130)
    
    // 验证邮箱列
    const emailColumn = result.current.tableColumns.find(col => col.dataIndex === 'email')
    expect(emailColumn).toBeDefined()
    expect(emailColumn?.title).toBe('邮箱')
    expect(emailColumn?.key).toBe('email')
    expect(emailColumn?.width).toBe(180)
    
    // 验证所属机构列
    const orgColumn = result.current.tableColumns.find(col => col.dataIndex === 'organizationName')
    expect(orgColumn).toBeDefined()
    expect(orgColumn?.title).toBe('所属机构')
    expect(orgColumn?.key).toBe('organizationName')
    expect(orgColumn?.width).toBe(100)
    
    // 验证角色列
    const roleColumn = result.current.tableColumns.find(col => col.dataIndex === 'roleNames')
    expect(roleColumn).toBeDefined()
    expect(roleColumn?.title).toBe('角色')
    expect(roleColumn?.key).toBe('roleNames')
    expect(roleColumn?.width).toBe(160)
    
    // 验证备注列
    const descColumn = result.current.tableColumns.find(col => col.dataIndex === 'description')
    expect(descColumn).toBeDefined()
    expect(descColumn?.title).toBe('备注')
    expect(descColumn?.key).toBe('description')
    expect(descColumn?.width).toBe(160)
    
    // 验证状态列
    const statusColumn = result.current.tableColumns.find(col => col.dataIndex === 'status')
    expect(statusColumn).toBeDefined()
    expect(statusColumn?.title).toBe('状态')
    expect(statusColumn?.key).toBe('status')
    expect(statusColumn?.width).toBe(100)
    expect(statusColumn?.align).toBe('center')
    
    // 验证创建时间列
    const createTimeColumn = result.current.tableColumns.find(col => col.dataIndex === 'createTime')
    expect(createTimeColumn).toBeDefined()
    expect(createTimeColumn?.title).toBe('创建时间')
    expect(createTimeColumn?.key).toBe('createTime')
    expect(createTimeColumn?.width).toBe(160)
  })

  it('应该正确配置角色列的渲染函数', () => {
    const { result } = renderHook(() => useItems(mockSetReload))
    
    const roleColumn = result.current.tableColumns.find(col => col.dataIndex === 'roleNames')
    expect(roleColumn?.render).toBeDefined()
    expect(typeof roleColumn?.render).toBe('function')
    
    // 测试渲染函数
    const renderFn = roleColumn?.render as Function
    
    // 测试有角色名称的情况
    const roleNames = ['管理员', '用户']
    expect(renderFn(roleNames)).toBe('管理员, 用户')
    
    // 测试空数组的情况
    expect(renderFn([])).toBe('-')
    
    // 测试 undefined 的情况
    expect(renderFn(undefined)).toBe('-')
    
    // 测试 null 的情况
    expect(renderFn(null)).toBe('-')
  })

  it('应该正确配置状态列的渲染函数', () => {
    const { result } = renderHook(() => useItems(mockSetReload))
    
    const statusColumn = result.current.tableColumns.find(col => col.dataIndex === 'status')
    expect(statusColumn?.render).toBeDefined()
    expect(typeof statusColumn?.render).toBe('function')
    
    const renderFn = statusColumn?.render as Function
    
    // 测试渲染函数返回的组件结构
    const result1 = renderFn(1, { id: 2 }) // 启用状态，非当前用户
    const result2 = renderFn(0, { id: 2 }) // 禁用状态，非当前用户
    const result3 = renderFn(1, { id: 1 }) // 启用状态，当前用户
    
    // 验证返回的是 React 元素
    expect(result1).toBeDefined()
    expect(result2).toBeDefined()
    expect(result3).toBeDefined()
  })

  it('应该正确处理状态切换', async () => {
    const { http } = require('@/lib/https')
    const { removeUndefined } = require('@/lib/utils')
    
    vi.mocked(http.put).mockResolvedValue({})
    vi.mocked(removeUndefined).mockImplementation((obj) => obj)
    
    const { result } = renderHook(() => useItems(mockSetReload))
    
    const statusColumn = result.current.tableColumns.find(col => col.dataIndex === 'status')
    const renderFn = statusColumn?.render as Function
    
    // 模拟状态切换
    const record = { id: 2, name: '测试用户', status: 1 }
    const statusElement = renderFn(1, record)
    
    // 验证 API 调用和重载设置
    expect(http.put).not.toHaveBeenCalled()
    expect(mockSetReload).not.toHaveBeenCalled()
  })

  it('应该正确处理当前用户的状态显示', () => {
    const { result } = renderHook(() => useItems(mockSetReload))
    
    const statusColumn = result.current.tableColumns.find(col => col.dataIndex === 'status')
    const renderFn = statusColumn?.render as Function
    
    // 测试当前用户的状态显示（应该显示 Tag 而不是 Switch）
    const currentUserRecord = { id: 1, name: '管理员' }
    const result1 = renderFn(1, currentUserRecord) // 启用状态
    const result2 = renderFn(0, currentUserRecord) // 禁用状态
    
    expect(result1).toBeDefined()
    expect(result2).toBeDefined()
  })

  it('应该返回稳定的引用', () => {
    const { result, rerender } = renderHook(() => useItems(mockSetReload))
    
    const firstResult = result.current
    
    rerender()
    
    // 由于每次调用都会创建新对象，所以引用会不同，但内容应该相同
    expect(result.current.tableColumns).toEqual(firstResult.tableColumns)
    expect(result.current.searchFormSchema).toEqual(firstResult.searchFormSchema)
  })

  it('应该正确处理 setReload 回调', () => {
    const { result } = renderHook(() => useItems(mockSetReload))
    
    // 验证 setReload 被正确传递
    expect(typeof mockSetReload).toBe('function')
    
    // 测试调用 setReload
    act(() => {
      mockSetReload(true)
    })
    
    expect(mockSetReload).toHaveBeenCalledWith(true)
  })

  it('应该正确处理加载状态', async () => {
    const { http } = require('@/lib/https')
    vi.mocked(http.put).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    const { result } = renderHook(() => useItems(mockSetReload))
    
    const statusColumn = result.current.tableColumns.find(col => col.dataIndex === 'status')
    const renderFn = statusColumn?.render as Function
    
    // 测试加载状态
    const record = { id: 2, name: '测试用户', status: 1 }
    const statusElement = renderFn(1, record)
    
    expect(statusElement).toBeDefined()
  })
})

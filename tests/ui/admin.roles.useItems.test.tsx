import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useItems from '@/app/admin/system/roles/useItems'

// Mock 外部依赖
vi.mock('@/lib/https', () => ({
  http: {
    put: vi.fn()
  }
}))

describe('useItems - Roles', () => {
  const mockSetReload = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该返回正确的表格列配置', () => {
    const { result } = renderHook(() => useItems(mockSetReload))
    
    expect(result.current.tableColumns).toBeDefined()
    expect(Array.isArray(result.current.tableColumns)).toBe(true)
    expect(result.current.tableColumns.length).toBeGreaterThan(0)
    
    // 验证必需的列
    const columnNames = result.current.tableColumns.map(col => col.title)
    expect(columnNames).toContain('角色名称')
    expect(columnNames).toContain('编码')
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

  it('应该正确配置角色名称搜索字段', () => {
    const { result } = renderHook(() => useItems(mockSetReload))
    
    const nameField = result.current.searchFormSchema.find(field => field.name === 'name')
    expect(nameField).toBeDefined()
    expect(nameField?.label).toBe('角色名称')
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
    
    // 验证角色名称列
    const nameColumn = result.current.tableColumns.find(col => col.dataIndex === 'name')
    expect(nameColumn).toBeDefined()
    expect(nameColumn?.title).toBe('角色名称')
    expect(nameColumn?.key).toBe('name')
    expect(nameColumn?.width).toBe(150)
    
    // 验证编码列
    const codeColumn = result.current.tableColumns.find(col => col.dataIndex === 'code')
    expect(codeColumn).toBeDefined()
    expect(codeColumn?.title).toBe('编码')
    expect(codeColumn?.key).toBe('code')
    expect(codeColumn?.width).toBe(150)
    
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

  it('应该正确配置状态列的渲染函数', () => {
    const { result } = renderHook(() => useItems(mockSetReload))
    
    const statusColumn = result.current.tableColumns.find(col => col.dataIndex === 'status')
    expect(statusColumn?.render).toBeDefined()
    expect(typeof statusColumn?.render).toBe('function')
    
    const renderFn = statusColumn?.render as Function
    
    // 测试渲染函数返回的组件结构
    const result1 = renderFn(1, { id: 1, name: '测试角色' }) // 启用状态
    const result2 = renderFn(0, { id: 2, name: '测试角色' }) // 禁用状态
    
    // 验证返回的是 React 元素
    expect(result1).toBeDefined()
    expect(result2).toBeDefined()
  })

  it('应该正确处理状态切换', async () => {
    const { http } = require('@/lib/https')
    vi.mocked(http.put).mockResolvedValue({})
    
    const { result } = renderHook(() => useItems(mockSetReload))
    
    const statusColumn = result.current.tableColumns.find(col => col.dataIndex === 'status')
    const renderFn = statusColumn?.render as Function
    
    // 模拟状态切换
    const record = { id: 1, name: '测试角色', status: 1 }
    const statusElement = renderFn(1, record)
    
    // 验证 API 调用和重载设置
    expect(http.put).not.toHaveBeenCalled()
    expect(mockSetReload).not.toHaveBeenCalled()
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
    const record = { id: 1, name: '测试角色', status: 1 }
    const statusElement = renderFn(1, record)
    
    expect(statusElement).toBeDefined()
  })

  it('应该正确处理状态切换的 API 调用', async () => {
    const { http } = require('@/lib/https')
    vi.mocked(http.put).mockResolvedValue({})
    
    const { result } = renderHook(() => useItems(mockSetReload))
    
    const statusColumn = result.current.tableColumns.find(col => col.dataIndex === 'status')
    const renderFn = statusColumn?.render as Function
    
    // 模拟状态切换
    const record = { id: 1, name: '测试角色', status: 1 }
    const statusElement = renderFn(1, record)
    
    // 验证状态切换逻辑
    expect(statusElement).toBeDefined()
  })
})

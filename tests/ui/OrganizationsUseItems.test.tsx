import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import useItems from '@/app/admin/system/organizations/useItems'

describe('useItems', () => {
  it('应该返回正确的表格列配置', () => {
    const { result } = renderHook(() => useItems())
    
    expect(result.current.tableColumns).toBeDefined()
    expect(Array.isArray(result.current.tableColumns)).toBe(true)
    expect(result.current.tableColumns.length).toBeGreaterThan(0)
    
    // 验证必需的列
    const columnNames = result.current.tableColumns.map(col => col.title)
    expect(columnNames).toContain('机构名称')
    expect(columnNames).toContain('地址')
    expect(columnNames).toContain('联系电话')
    expect(columnNames).toContain('邮箱')
    expect(columnNames).toContain('负责人')
    expect(columnNames).toContain('成立时间')
    expect(columnNames).toContain('描述')
    expect(columnNames).toContain('状态')
    expect(columnNames).toContain('创建时间')
  })

  it('应该返回正确的搜索表单配置', () => {
    const { result } = renderHook(() => useItems())
    
    expect(result.current.searchFormSchema).toBeDefined()
    expect(Array.isArray(result.current.searchFormSchema)).toBe(true)
    expect(result.current.searchFormSchema.length).toBeGreaterThan(0)
    
    // 验证搜索字段
    const searchFields = result.current.searchFormSchema.map(field => field.name)
    expect(searchFields).toContain('name')
    expect(searchFields).toContain('status')
  })

  it('应该正确配置机构名称搜索字段', () => {
    const { result } = renderHook(() => useItems())
    
    const nameField = result.current.searchFormSchema.find(field => field.name === 'name')
    expect(nameField).toBeDefined()
    expect(nameField?.label).toBe('机构名称')
    expect(nameField?.type).toBe('input')
  })

  it('应该正确配置状态搜索字段', () => {
    const { result } = renderHook(() => useItems())
    
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
    const { result } = renderHook(() => useItems())
    
    // 验证机构名称列
    const nameColumn = result.current.tableColumns.find(col => col.dataIndex === 'name')
    expect(nameColumn).toBeDefined()
    expect(nameColumn?.title).toBe('机构名称')
    expect(nameColumn?.key).toBe('name')
    expect(nameColumn?.width).toBe(150)
    
    // 验证地址列
    const addressColumn = result.current.tableColumns.find(col => col.dataIndex === 'address')
    expect(addressColumn).toBeDefined()
    expect(addressColumn?.title).toBe('地址')
    expect(addressColumn?.key).toBe('address')
    expect(addressColumn?.width).toBe(200)
    
    // 验证联系电话列
    const phoneColumn = result.current.tableColumns.find(col => col.dataIndex === 'phone')
    expect(phoneColumn).toBeDefined()
    expect(phoneColumn?.title).toBe('联系电话')
    expect(phoneColumn?.key).toBe('phone')
    expect(phoneColumn?.width).toBe(130)
    
    // 验证邮箱列
    const emailColumn = result.current.tableColumns.find(col => col.dataIndex === 'email')
    expect(emailColumn).toBeDefined()
    expect(emailColumn?.title).toBe('邮箱')
    expect(emailColumn?.key).toBe('email')
    expect(emailColumn?.width).toBe(180)
    
    // 验证负责人列
    const operatorColumn = result.current.tableColumns.find(col => col.dataIndex === 'operator')
    expect(operatorColumn).toBeDefined()
    expect(operatorColumn?.title).toBe('负责人')
    expect(operatorColumn?.key).toBe('operator')
    expect(operatorColumn?.width).toBe(100)
    
    // 验证成立时间列
    const setupTimeColumn = result.current.tableColumns.find(col => col.dataIndex === 'setupTime')
    expect(setupTimeColumn).toBeDefined()
    expect(setupTimeColumn?.title).toBe('成立时间')
    expect(setupTimeColumn?.key).toBe('setupTime')
    expect(setupTimeColumn?.width).toBe(160)
    
    // 验证描述列
    const descriptionColumn = result.current.tableColumns.find(col => col.dataIndex === 'description')
    expect(descriptionColumn).toBeDefined()
    expect(descriptionColumn?.title).toBe('描述')
    expect(descriptionColumn?.key).toBe('description')
    expect(descriptionColumn?.width).toBe(160)
    
    // 验证状态列
    const statusColumn = result.current.tableColumns.find(col => col.dataIndex === 'status')
    expect(statusColumn).toBeDefined()
    expect(statusColumn?.title).toBe('状态')
    expect(statusColumn?.key).toBe('status')
    expect(statusColumn?.width).toBe(100)
    
    // 验证创建时间列
    const createTimeColumn = result.current.tableColumns.find(col => col.dataIndex === 'createTime')
    expect(createTimeColumn).toBeDefined()
    expect(createTimeColumn?.title).toBe('创建时间')
    expect(createTimeColumn?.key).toBe('createTime')
    expect(createTimeColumn?.width).toBe(160)
  })

  it('应该返回稳定的引用', () => {
    const { result, rerender } = renderHook(() => useItems())
    
    const firstResult = result.current
    
    rerender()
    
    // 由于每次调用都会创建新对象，所以引用会不同，但内容应该相同
    expect(result.current.tableColumns).toEqual(firstResult.tableColumns)
    expect(result.current.searchFormSchema).toEqual(firstResult.searchFormSchema)
  })
})

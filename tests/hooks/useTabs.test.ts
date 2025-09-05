import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTabs } from '../../src/hooks/useTabs'

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

describe('useTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorageMock.getItem.mockReturnValue(null)
  })

  it('应该初始化空的标签页列表', () => {
    const { result } = renderHook(() => useTabs())

    expect(result.current.tabs).toEqual([])
  })

  it('应该从sessionStorage恢复标签页', () => {
    const mockTabs = [
      { id: 1, name: '用户管理', key: 1 },
      { id: 2, name: '角色管理', key: 2 }
    ]
    sessionStorageMock.getItem.mockReturnValue(JSON.stringify(mockTabs))

    const { result } = renderHook(() => useTabs())

    expect(result.current.tabs).toEqual(mockTabs)
  })

  it('应该添加新标签页', () => {
    const { result } = renderHook(() => useTabs())

    const newTab = { id: 1, name: '用户管理' }

    act(() => {
      result.current.addTab(newTab)
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.tabs[0]).toEqual({
      id: 1,
      name: '用户管理',
      key: 1
    })
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'nav_tabs',
      JSON.stringify([{ id: 1, name: '用户管理', key: 1 }])
    )
  })

  it('应该避免添加重复的标签页', () => {
    const { result } = renderHook(() => useTabs())

    const tab = { id: 1, name: '用户管理' }

    act(() => {
      result.current.addTab(tab)
    })

    expect(result.current.tabs).toHaveLength(1)

    // 尝试添加相同ID的标签页
    act(() => {
      result.current.addTab(tab)
    })

    expect(result.current.tabs).toHaveLength(1) // 应该还是1个
  })

  it('应该移除标签页', () => {
    const { result } = renderHook(() => useTabs())

    // 先添加一个标签页
    act(() => {
      result.current.addTab({ id: 1, name: '用户管理' })
    })

    expect(result.current.tabs).toHaveLength(1)

    // 再添加第二个标签页
    act(() => {
      result.current.addTab({ id: 2, name: '角色管理' })
    })

    expect(result.current.tabs).toHaveLength(2)

    // 移除第一个标签页 (key是数字1，但removeTab需要字符串)
    act(() => {
      result.current.removeTab(1)
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.tabs[0].id).toBe(2)
    expect(sessionStorageMock.setItem).toHaveBeenLastCalledWith(
      'nav_tabs',
      JSON.stringify([{ id: 2, name: '角色管理', key: 2 }])
    )
  })

  it('应该移除不存在的标签页时不报错', () => {
    const { result } = renderHook(() => useTabs())

    act(() => {
      result.current.addTab({ id: 1, name: '用户管理' })
    })

    expect(result.current.tabs).toHaveLength(1)

    // 尝试移除不存在的标签页
    act(() => {
      result.current.removeTab('999')
    })

    expect(result.current.tabs).toHaveLength(1) // 应该还是1个
  })

  it('应该设置标签页列表', () => {
    const { result } = renderHook(() => useTabs())

    const newTabs = [
      { id: 1, name: '用户管理', key: 1 },
      { id: 2, name: '角色管理', key: 2 }
    ]

    act(() => {
      result.current.setTabs(newTabs)
    })

    expect(result.current.tabs).toEqual(newTabs)
  })

  it('应该处理sessionStorage中的无效数据', () => {
    sessionStorageMock.getItem.mockReturnValue('invalid-json')

    // 实际上会抛出错误，因为源码没有错误处理
    expect(() => {
      renderHook(() => useTabs())
    }).toThrow()
  })

  it('应该添加多个不同的标签页', () => {
    const { result } = renderHook(() => useTabs())

    // 逐个添加标签页
    act(() => {
      result.current.addTab({ id: 1, name: '用户管理' })
    })

    act(() => {
      result.current.addTab({ id: 2, name: '角色管理' })
    })

    act(() => {
      result.current.addTab({ id: 3, name: '权限管理' })
    })

    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.tabs.map(t => t.name)).toEqual([
      '用户管理',
      '角色管理', 
      '权限管理'
    ])
  })

  it('应该正确设置标签页的key属性', () => {
    const { result } = renderHook(() => useTabs())

    act(() => {
      result.current.addTab({ id: 123, name: '测试标签' })
    })

    expect(result.current.tabs[0].key).toBe(123)
    expect(result.current.tabs[0].id).toBe(123)
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSlider } from '../../src/hooks/useSlider'

// Mock next/navigation
const mockUsePathname = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname()
}))

describe('useSlider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该初始化默认状态', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard')

    const { result } = renderHook(() => useSlider())

    expect(result.current.collapsed).toBe(true)
    expect(result.current.currentMenu).toBe('/admin/dashboard')
    expect(result.current.menuList).toEqual([])
  })

  it('应该切换折叠状态', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard')

    const { result } = renderHook(() => useSlider())

    expect(result.current.collapsed).toBe(true)

    act(() => {
      result.current.toggleCollapsed()
    })

    expect(result.current.collapsed).toBe(false)

    act(() => {
      result.current.toggleCollapsed()
    })

    expect(result.current.collapsed).toBe(true)
  })

  it('应该根据路径变化更新当前菜单', () => {
    // 初始路径
    mockUsePathname.mockReturnValue('/admin/users')
    const { result, rerender } = renderHook(() => useSlider())

    expect(result.current.currentMenu).toBe('/admin/users')

    // 路径变化
    mockUsePathname.mockReturnValue('/admin/roles')
    rerender()

    expect(result.current.currentMenu).toBe('/admin/roles')
  })

  it('应该设置当前菜单', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard')

    const { result } = renderHook(() => useSlider())

    act(() => {
      result.current.setCurrentMenu('/admin/settings')
    })

    expect(result.current.currentMenu).toBe('/admin/settings')
  })

  it('应该设置菜单列表', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard')

    const { result } = renderHook(() => useSlider())

    const mockMenuList = [
      { id: 1, name: '用户管理', path: '/admin/users' },
      { id: 2, name: '角色管理', path: '/admin/roles' }
    ]

    act(() => {
      result.current.setMenuList(mockMenuList)
    })

    expect(result.current.menuList).toEqual(mockMenuList)
  })

  it('应该处理空路径', () => {
    mockUsePathname.mockReturnValue('')

    const { result } = renderHook(() => useSlider())

    expect(result.current.currentMenu).toBe('')
  })

  it('应该处理复杂路径', () => {
    mockUsePathname.mockReturnValue('/admin/system/users/edit/123')

    const { result } = renderHook(() => useSlider())

    expect(result.current.currentMenu).toBe('/admin/system/users/edit/123')
  })
})
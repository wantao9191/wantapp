import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../../src/hooks/useTheme'

describe('useTheme', () => {
  it('应该初始化为light主题', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('light')
  })

  it('应该切换到dark主题', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')
  })

  it('应该从dark切换回light主题', () => {
    const { result } = renderHook(() => useTheme())

    // 先切换到dark
    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')

    // 再切换回light
    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('light')
  })

  it('应该支持多次切换', () => {
    const { result } = renderHook(() => useTheme())

    // 初始状态
    expect(result.current.theme).toBe('light')

    // 第一次切换
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('dark')

    // 第二次切换
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('light')

    // 第三次切换
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('dark')

    // 第四次切换
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('light')
  })
})
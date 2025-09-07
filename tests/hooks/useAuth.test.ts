import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../../src/hooks/useAuth'

// Mock dependencies
vi.mock('../../src/lib/https', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

vi.mock('js-cookie', () => ({
  default: {
    set: vi.fn(),
    get: vi.fn(),
    remove: vi.fn()
  }
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn()
  })
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock URL.createObjectURL
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'blob:mock-url')
  }
})

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('应该初始化默认状态', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.checked).toBe(false)
    expect(result.current.captcha).toBeNull()
    expect(result.current.userInfo).toBeNull()
    expect(result.current.isLogin).toBe(false)
  })

  it('应该从localStorage恢复用户信息', () => {
    const mockUserInfo = { id: 1, name: '测试用户' }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserInfo))

    const { result } = renderHook(() => useAuth())

    expect(result.current.userInfo).toEqual(mockUserInfo)
    expect(result.current.isLogin).toBe(true)
  })

  it('应该处理无效的localStorage数据', () => {
    localStorageMock.getItem.mockReturnValue('undefined')

    const { result } = renderHook(() => useAuth())

    expect(result.current.userInfo).toBeNull()
    expect(result.current.isLogin).toBe(false)
  })

  it('应该获取验证码', async () => {
    const { http } = await import('../../src/lib/https')
    const mockBlob = new Blob(['mock-image'], { type: 'image/png' })
    vi.mocked(http.get).mockResolvedValue({
      code: 200,
      message: 'success',
      success: true,
      data: mockBlob
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.getCaptcha()
    })

    expect(http.get).toHaveBeenCalledWith('/captcha')
    expect(result.current.captcha).toBe('blob:mock-url')
  })

  it('应该处理验证码获取失败', async () => {
    const { http } = await import('../../src/lib/https')
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { })
    vi.mocked(http.get).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.getCaptcha()
    })

    expect(consoleLogSpy).toHaveBeenCalled()
    consoleLogSpy.mockRestore()
  })

  it('应该成功登录', async () => {
    const { http } = await import('../../src/lib/https')
    const Cookies = (await import('js-cookie')).default

    const mockResponse = {
      code: 200,
      message: 'success',
      success: true,
      data: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userInfo: { id: 1, name: '测试用户' }
      }
    }
    vi.mocked(http.post).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('testuser', 'password', '1234')
    })

    expect(http.post).toHaveBeenCalledWith('/admin/auth/login', {
      username: 'testuser',
      password: 'password',
      code: '1234'
    })
    expect(Cookies.set).toHaveBeenCalledWith('access_token', 'mock-token')
    expect(Cookies.set).toHaveBeenCalledWith('refresh_token', 'mock-refresh-token', { httpOnly: false, secure: true })
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'userInfo',
      JSON.stringify(mockResponse.data.userInfo)
    )
    expect(result.current.userInfo).toEqual(mockResponse.data.userInfo)
    expect(result.current.isLogin).toBe(true)
  })

  it('应该在记住密码时保存登录信息', async () => {
    const { http } = await import('../../src/lib/https')

    const mockResponse = {
      code: 200,
      message: 'success',
      success: true,
      data: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userInfo: { id: 1, name: '测试用户' }
      }
    }
    vi.mocked(http.post).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth())

    // 设置记住密码
    act(() => {
      result.current.setChecked(true)
    })

    await act(async () => {
      await result.current.login('testuser', 'password', '1234')
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'login_info',
      JSON.stringify({ username: 'testuser', password: 'password' })
    )
  })

  it('应该处理登录失败', async () => {
    const { http } = await import('../../src/lib/https')
    const error = new Error('Login failed')
    vi.mocked(http.post).mockRejectedValue(error)

    const { result } = renderHook(() => useAuth())

    await expect(
      act(async () => {
        await result.current.login('testuser', 'wrongpassword', '1234')
      })
    ).rejects.toThrow('Login failed')
  })

  it('应该更新checked状态', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.setChecked(true)
    })

    expect(result.current.checked).toBe(true)
  })
})
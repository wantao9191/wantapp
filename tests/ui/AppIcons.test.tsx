import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import AppIcon, { ICON_NAMES } from '@/components/ui/AppIcons'

// Mock @ant-design/icons
vi.mock('@ant-design/icons', () => ({
  HomeOutlined: ({ className, style, ...props }: any) => (
    <div data-testid="home-icon" className={className} style={style} {...props}>
      Home Icon
    </div>
  ),
  UserOutlined: ({ className, style, ...props }: any) => (
    <div data-testid="user-icon" className={className} style={style} {...props}>
      User Icon
    </div>
  ),
  SettingOutlined: ({ className, style, ...props }: any) => (
    <div data-testid="setting-icon" className={className} style={style} {...props}>
      Setting Icon
    </div>
  ),
  NonExistentIcon: undefined
}))

// Mock console.warn
const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

describe('AppIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    consoleSpy.mockRestore()
  })

  it('应该正确渲染存在的图标', () => {
    render(<AppIcon name="HomeOutlined" />)
    
    expect(screen.getByTestId('home-icon')).toBeInTheDocument()
    expect(screen.getByText('Home Icon')).toBeInTheDocument()
  })

  it('应该应用自定义样式', () => {
    const customStyle = { color: 'red', fontSize: '24px' }
    
    render(<AppIcon name="HomeOutlined" style={customStyle} />)
    
    const icon = screen.getByTestId('home-icon')
    expect(icon).toHaveStyle(customStyle)
  })

  it('应该应用自定义类名', () => {
    render(<AppIcon name="HomeOutlined" className="custom-icon" />)
    
    const icon = screen.getByTestId('home-icon')
    expect(icon).toHaveClass('custom-icon')
  })

  it('应该应用 size 属性', () => {
    render(<AppIcon name="HomeOutlined" size={24} />)
    
    const icon = screen.getByTestId('home-icon')
    expect(icon).toHaveStyle({ fontSize: 24 })
  })

  it('应该应用 color 属性', () => {
    render(<AppIcon name="HomeOutlined" color="#1890ff" />)
    
    const icon = screen.getByTestId('home-icon')
    expect(icon).toHaveStyle({ color: '#1890ff' })
  })

  it('应该合并 size 和 color 到 style 中', () => {
    render(<AppIcon name="HomeOutlined" size={32} color="blue" />)
    
    const icon = screen.getByTestId('home-icon')
    expect(icon).toHaveStyle({ 
      fontSize: 32,
      color: 'blue'
    })
  })

  it('应该传递额外的属性', () => {
    render(
      <AppIcon 
        name="HomeOutlined" 
        data-testid="extra-test"
        onClick={() => {}}
      />
    )
    
    const icon = screen.getByTestId('extra-test')
    expect(icon).toBeInTheDocument()
  })

  it('应该处理不存在的图标', () => {
    render(<AppIcon name="NonExistentIcon" />)
    
    expect(screen.queryByTestId('non-existent-icon')).not.toBeInTheDocument()
    expect(consoleSpy).toHaveBeenCalledWith('Icon "NonExistentIcon" not found in @ant-design/icons')
  })

  it('应该支持不同的图标类型', () => {
    const { rerender } = render(<AppIcon name="HomeOutlined" />)
    expect(screen.getByTestId('home-icon')).toBeInTheDocument()
    
    rerender(<AppIcon name="UserOutlined" />)
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
    
    rerender(<AppIcon name="SettingOutlined" />)
    expect(screen.getByTestId('setting-icon')).toBeInTheDocument()
  })

  it('应该正确处理 style 和 size/color 的优先级', () => {
    const customStyle = { fontSize: '48px', color: 'green' }
    
    render(
      <AppIcon 
        name="HomeOutlined" 
        size={24}
        color="red"
        style={customStyle}
      />
    )
    
    const icon = screen.getByTestId('home-icon')
    // style 应该覆盖 size 和 color
    expect(icon).toHaveStyle(customStyle)
  })

  it('应该支持字符串类型的 size', () => {
    render(<AppIcon name="HomeOutlined" size="2rem" />)
    
    const icon = screen.getByTestId('home-icon')
    expect(icon).toHaveStyle({ fontSize: '2rem' })
  })
})

describe('ICON_NAMES', () => {
  it('应该包含所有预定义的图标名称', () => {
    expect(ICON_NAMES.HOME).toBe('HomeOutlined')
    expect(ICON_NAMES.USER).toBe('UserOutlined')
    expect(ICON_NAMES.SETTING).toBe('SettingOutlined')
    expect(ICON_NAMES.MENU).toBe('MenuOutlined')
    expect(ICON_NAMES.CLOSE).toBe('CloseOutlined')
    expect(ICON_NAMES.EDIT).toBe('EditOutlined')
    expect(ICON_NAMES.DELETE).toBe('DeleteOutlined')
    expect(ICON_NAMES.ADD).toBe('PlusOutlined')
    expect(ICON_NAMES.SAVE).toBe('SaveOutlined')
    expect(ICON_NAMES.SEARCH).toBe('SearchOutlined')
    expect(ICON_NAMES.SUCCESS).toBe('CheckCircleOutlined')
    expect(ICON_NAMES.ERROR).toBe('CloseCircleOutlined')
    expect(ICON_NAMES.WARNING).toBe('ExclamationCircleOutlined')
    expect(ICON_NAMES.INFO).toBe('InfoCircleOutlined')
    expect(ICON_NAMES.LOADING).toBe('LoadingOutlined')
    expect(ICON_NAMES.UP).toBe('UpOutlined')
    expect(ICON_NAMES.DOWN).toBe('DownOutlined')
    expect(ICON_NAMES.LEFT).toBe('LeftOutlined')
    expect(ICON_NAMES.RIGHT).toBe('RightOutlined')
    expect(ICON_NAMES.FILE).toBe('FileOutlined')
    expect(ICON_NAMES.FOLDER).toBe('FolderOutlined')
    expect(ICON_NAMES.DOWNLOAD).toBe('DownloadOutlined')
    expect(ICON_NAMES.UPLOAD).toBe('UploadOutlined')
    expect(ICON_NAMES.MAIL).toBe('MailOutlined')
    expect(ICON_NAMES.PHONE).toBe('PhoneOutlined')
    expect(ICON_NAMES.MESSAGE).toBe('MessageOutlined')
    expect(ICON_NAMES.NOTIFICATION).toBe('NotificationOutlined')
  })

  it('应该包含导航图标', () => {
    expect(ICON_NAMES.HOME).toBe('HomeOutlined')
    expect(ICON_NAMES.USER).toBe('UserOutlined')
    expect(ICON_NAMES.SETTING).toBe('SettingOutlined')
    expect(ICON_NAMES.MENU).toBe('MenuOutlined')
    expect(ICON_NAMES.CLOSE).toBe('CloseOutlined')
  })

  it('应该包含操作图标', () => {
    expect(ICON_NAMES.EDIT).toBe('EditOutlined')
    expect(ICON_NAMES.DELETE).toBe('DeleteOutlined')
    expect(ICON_NAMES.ADD).toBe('PlusOutlined')
    expect(ICON_NAMES.SAVE).toBe('SaveOutlined')
    expect(ICON_NAMES.SEARCH).toBe('SearchOutlined')
  })

  it('应该包含状态图标', () => {
    expect(ICON_NAMES.SUCCESS).toBe('CheckCircleOutlined')
    expect(ICON_NAMES.ERROR).toBe('CloseCircleOutlined')
    expect(ICON_NAMES.WARNING).toBe('ExclamationCircleOutlined')
    expect(ICON_NAMES.INFO).toBe('InfoCircleOutlined')
    expect(ICON_NAMES.LOADING).toBe('LoadingOutlined')
  })

  it('应该包含方向图标', () => {
    expect(ICON_NAMES.UP).toBe('UpOutlined')
    expect(ICON_NAMES.DOWN).toBe('DownOutlined')
    expect(ICON_NAMES.LEFT).toBe('LeftOutlined')
    expect(ICON_NAMES.RIGHT).toBe('RightOutlined')
  })

  it('应该包含文件图标', () => {
    expect(ICON_NAMES.FILE).toBe('FileOutlined')
    expect(ICON_NAMES.FOLDER).toBe('FolderOutlined')
    expect(ICON_NAMES.DOWNLOAD).toBe('DownloadOutlined')
    expect(ICON_NAMES.UPLOAD).toBe('UploadOutlined')
  })

  it('应该包含通信图标', () => {
    expect(ICON_NAMES.MAIL).toBe('MailOutlined')
    expect(ICON_NAMES.PHONE).toBe('PhoneOutlined')
    expect(ICON_NAMES.MESSAGE).toBe('MessageOutlined')
    expect(ICON_NAMES.NOTIFICATION).toBe('NotificationOutlined')
  })
})
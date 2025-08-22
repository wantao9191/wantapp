import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import Loading from '@/components/ui/Loading'

describe('Loading', () => {
  it('应该正确渲染加载组件', () => {
    render(<Loading />)
    
    expect(screen.getByText('长护管理系统')).toBeInTheDocument()
    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })

  it('应该包含加载动画元素', () => {
    const { container } = render(<Loading />)
    
    // 检查加载动画元素
    const loadingElement = container.querySelector('.loading')
    expect(loadingElement).toBeInTheDocument()
  })

  it('应该包含加载文本动画元素', () => {
    const { container } = render(<Loading />)
    
    // 检查加载文本动画元素
    const loadingTextElement = container.querySelector('.loading-text')
    expect(loadingTextElement).toBeInTheDocument()
  })

  it('应该应用正确的样式类', () => {
    const { container } = render(<Loading />)
    
    const loadingContainer = container.firstChild as HTMLElement
    expect(loadingContainer).toHaveClass(
      'min-h-screen',
      'w-full',
      'flex',
      'flex-col',
      'justify-center',
      'items-center',
      'text-slate-800',
      'bg-gradient-to-br',
      'from-[#4facfe]',
      'via-[#00f2fe]',
      'to-[#e0f7ff]',
      'relative',
      'overflow-hidden'
    )
  })

  it('应该包含背景装饰元素', () => {
    const { container } = render(<Loading />)
    
    // 检查背景装饰容器
    const backgroundContainer = container.querySelector('.absolute.inset-0.opacity-30')
    expect(backgroundContainer).toBeInTheDocument()
    
    // 检查各个装饰圆点
    const decorativeCircles = backgroundContainer?.querySelectorAll('div')
    expect(decorativeCircles).toHaveLength(5)
  })

  it('应该包含主要内容区域', () => {
    const { container } = render(<Loading />)
    
    const mainContent = container.querySelector('.relative.z-10.flex.flex-col.items-center')
    expect(mainContent).toBeInTheDocument()
  })

  it('应该包含底部渐变装饰', () => {
    const { container } = render(<Loading />)
    
    const bottomGradient = container.querySelector('.absolute.bottom-0.left-0.right-0.h-32.bg-gradient-to-t.from-blue-900\\/10.to-transparent')
    expect(bottomGradient).toBeInTheDocument()
  })

  it('应该应用正确的文本样式', () => {
    const { container } = render(<Loading />)
    
    const titleElement = container.querySelector('.text-3xl.font-bold.loading-text')
    expect(titleElement).toBeInTheDocument()
    expect(titleElement).toHaveTextContent('长护管理系统')
    
    const subtitleElement = container.querySelector('.text-sm.mt-2.opacity-80.animate-pulse')
    expect(subtitleElement).toBeInTheDocument()
    expect(subtitleElement).toHaveTextContent('加载中...')
  })

  it('应该包含正确的动画类', () => {
    const { container } = render(<Loading />)
    
    // 检查背景装饰元素的动画类
    const backgroundContainer = container.querySelector('.absolute.inset-0.opacity-30')
    const circles = backgroundContainer?.querySelectorAll('div')
    
    if (circles) {
      // 第一个圆点应该有 animate-pulse 类
      expect(circles[0]).toHaveClass('animate-pulse')
      
      // 第二个圆点应该有 animate-pulse delay-1000 类
      expect(circles[1]).toHaveClass('animate-pulse', 'delay-1000')
      
      // 第三个圆点应该有 animate-pulse delay-500 类
      expect(circles[2]).toHaveClass('animate-pulse', 'delay-500')
      
      // 第四个圆点应该有 animate-pulse delay-700 类
      expect(circles[3]).toHaveClass('animate-pulse', 'delay-700')
      
      // 第五个圆点应该有 animate-pulse delay-300 类
      expect(circles[4]).toHaveClass('animate-pulse', 'delay-300')
    }
  })

  it('应该包含正确的模糊效果类', () => {
    const { container } = render(<Loading />)
    
    const backgroundContainer = container.querySelector('.absolute.inset-0.opacity-30')
    const circles = backgroundContainer?.querySelectorAll('div')
    
    if (circles) {
      // 检查不同大小的模糊效果
      expect(circles[0]).toHaveClass('blur-xl')
      expect(circles[1]).toHaveClass('blur-lg')
      expect(circles[2]).toHaveClass('blur-md')
      expect(circles[3]).toHaveClass('blur-lg')
      expect(circles[4]).toHaveClass('blur-sm')
    }
  })

  it('应该包含正确的尺寸类', () => {
    const { container } = render(<Loading />)
    
    const backgroundContainer = container.querySelector('.absolute.inset-0.opacity-30')
    const circles = backgroundContainer?.querySelectorAll('div')
    
    if (circles) {
      // 检查不同尺寸的圆点
      expect(circles[0]).toHaveClass('w-32', 'h-32')
      expect(circles[1]).toHaveClass('w-24', 'h-24')
      expect(circles[2]).toHaveClass('w-16', 'h-16')
      expect(circles[3]).toHaveClass('w-20', 'h-20')
      expect(circles[4]).toHaveClass('w-12', 'h-12')
    }
  })

  it('应该包含正确的定位类', () => {
    const { container } = render(<Loading />)
    
    const backgroundContainer = container.querySelector('.absolute.inset-0.opacity-30')
    const circles = backgroundContainer?.querySelectorAll('div')
    
    if (circles) {
      // 检查不同位置的圆点
      expect(circles[0]).toHaveClass('top-1/4', 'left-1/4')
      expect(circles[1]).toHaveClass('bottom-1/4', 'right-1/4')
      expect(circles[2]).toHaveClass('top-3/4', 'left-1/3')
      expect(circles[3]).toHaveClass('top-1/2', 'right-1/3')
      expect(circles[4]).toHaveClass('bottom-1/3', 'left-1/2')
    }
  })

  it('应该保持正确的 DOM 结构', () => {
    const { container } = render(<Loading />)
    
    const loadingContainer = container.firstChild as HTMLElement
    const backgroundContainer = loadingContainer.querySelector('.absolute.inset-0.opacity-30')
    const mainContent = loadingContainer.querySelector('.relative.z-10.flex.flex-col.items-center')
    const bottomGradient = loadingContainer.querySelector('.absolute.bottom-0.left-0.right-0.h-32.bg-gradient-to-t.from-blue-900\\/10.to-transparent')
    
    expect(loadingContainer).toBeInTheDocument()
    expect(backgroundContainer).toBeInTheDocument()
    expect(mainContent).toBeInTheDocument()
    expect(bottomGradient).toBeInTheDocument()
  })

  it('应该包含正确的背景颜色类', () => {
    const { container } = render(<Loading />)
    
    const backgroundContainer = container.querySelector('.absolute.inset-0.opacity-30')
    const circles = backgroundContainer?.querySelectorAll('div')
    
    if (circles) {
      // 检查背景颜色
      expect(circles[0]).toHaveClass('bg-white')
      expect(circles[1]).toHaveClass('bg-blue-200')
      expect(circles[2]).toHaveClass('bg-white')
      expect(circles[3]).toHaveClass('bg-blue-100')
      expect(circles[4]).toHaveClass('bg-white')
    }
  })
})

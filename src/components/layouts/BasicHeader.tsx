'use client'
import React from 'react'
import { Breadcrumb } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined, ReloadOutlined, ExpandOutlined, MoonFilled, SunFilled } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { LayoutProps, ThemeProps } from '@/types'

interface BasicHeaderProps extends LayoutProps, ThemeProps {
  isMobile?: boolean
}

const BasicHeader = ({ collapsed, toggleCollapsed, toggleTheme, theme, isMobile = false }: BasicHeaderProps) => {
  const router = useRouter()
  
  const reload = () => {
    // 使用Next.js路由刷新而不是强制页面刷新
    router.refresh()
  }
  return (
    <div className='h-48px px-4 bg-white border-b-1 border-b-solid border-[#e6e6e6] '>
      <div className='h-full flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {isMobile ? (
            <MenuUnfoldOutlined
              className='text-16px cursor-pointer'
              onClick={() => toggleCollapsed && toggleCollapsed()}
            />
          ) : (
            collapsed ? (
              <MenuFoldOutlined
                className='text-12px cursor-pointer'
                onClick={() => toggleCollapsed && toggleCollapsed()}
              />
            ) : (
              <MenuUnfoldOutlined
                className='text-12px cursor-pointer'
                onClick={() => toggleCollapsed && toggleCollapsed()}
              />
            )
          )}
          <ReloadOutlined className='cursor-pointer leading-none text-12px' onClick={reload} />
          <Breadcrumb
            className={`leading-none ${isMobile ? 'hidden sm:block' : ''}`}
            items={[{ title: '首页' }, { title: '首页' }]}
          />
        </div>
        <div className='flex items-center gap-4'>
          {theme === 'light' ? <SunFilled className='cursor-pointer leading-none text-14px' onClick={toggleTheme} /> : <MoonFilled className='cursor-pointer leading-none  text-md' onClick={toggleTheme} />}
          <ExpandOutlined className='cursor-pointer leading-none  text-14px' />
        </div>
      </div>
    </div>
  )
}

export default BasicHeader
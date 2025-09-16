'use client'
import React, { useEffect, useMemo } from 'react'
import { Breadcrumb } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined, ReloadOutlined, ExpandOutlined, MoonFilled, SunFilled } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { LayoutProps, ThemeProps } from '@/types'

interface BasicHeaderProps extends LayoutProps, ThemeProps {
  userInfo?: any
  currentMenu?: string
  menuList?: any[]
}

const BasicHeader = ({ collapsed, toggleCollapsed, toggleTheme, theme, userInfo, currentMenu, menuList, addTab }: BasicHeaderProps) => {
  const router = useRouter()
  const breadcrumbItems = useMemo(() => {
    if (!currentMenu || !menuList) return []

    // 先查找第一层级菜单
    const firstLevelItem = menuList.find((item: any) => item.path === currentMenu)
    if (firstLevelItem) {
      return [{ title: firstLevelItem.name }]
    }

    // 如果在第一层级没找到，查找子菜单
    for (const parentItem of menuList) {
      if (parentItem.children) {
        const childItem = parentItem.children.find((child: any) => child.path === currentMenu)
        if (childItem) {
          // 返回父级和子级
          return [
            {
              title: parentItem.name,
              menu: {
                items: parentItem.children.map((child: any) => {
                  return {
                    key: child.id,
                    label: (
                      <a href={child.path} onClick={(e) => {
                        e.preventDefault()
                        router.push(child.path)
                        addTab?.(child)
                      }}>
                        {child.name}
                      </a>
                    )
                  }
                })
              }
            },
            { title: childItem.name }
          ]
        }
      }
    }

    return []
  }, [currentMenu, menuList])
  const reload = () => {
    // 使用Next.js路由刷新而不是强制页面刷新
    router.refresh()
  }
  return (
    <div className='h-48px px-4 bg-white border-b-1 border-b-solid border-[#e6e6e6] '>
      <div className='h-full flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {collapsed ? (
            <MenuFoldOutlined
              className='text-12px cursor-pointer'
              onClick={() => toggleCollapsed && toggleCollapsed()}
            />
          ) : (
            <MenuUnfoldOutlined
              className='text-12px cursor-pointer'
              onClick={() => toggleCollapsed && toggleCollapsed()}
            />
          )}
          <ReloadOutlined className='cursor-pointer leading-none text-12px' onClick={reload} />
          <Breadcrumb
            className="leading-none"
            items={breadcrumbItems}
          />
        </div>
        <div className='flex items-center gap-4'>
          {userInfo?.organizationName}
          {/* {theme === 'light' ? <SunFilled className='cursor-pointer leading-none text-14px' onClick={toggleTheme} /> : <MoonFilled className='cursor-pointer leading-none  text-md' onClick={toggleTheme} />}
          <ExpandOutlined className='cursor-pointer leading-none  text-14px' /> */}
        </div>
      </div>
    </div>
  )
}

export default BasicHeader
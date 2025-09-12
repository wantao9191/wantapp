'use client'
import React, { useEffect } from 'react'
import BasicAside from './BasicAside'
import BasicHeader from './BasicHeader'
import BasicTabs from './BasicTabs'
import { useSlider, useTheme, useTabs } from '@/hooks'
import { http } from '@/lib/https'

interface BasicLayoutProps {
  children: React.ReactNode
}

const BasicLayout: React.FC<BasicLayoutProps> = ({ children }) => {
  const { collapsed, toggleCollapsed, menuList, currentMenu, setCurrentMenu, setMenuList } = useSlider()
  const { theme, toggleTheme } = useTheme()
  const { tabs, addTab, setTabs, removeTab } = useTabs()
  useEffect(() => {
    const getMenuList = async () => {
      const menuList = sessionStorage.getItem('menu_list')
      if (menuList) {
        const contents = JSON.parse(menuList).map((item: any) => ({
          ...item,
          slider: item.children?.find((child: any) => child.path === currentMenu) ? true : false
        }))
        setMenuList(contents)
        return
      }
      const res = await http.get('/admin/menus/all')
      const contents = res.data.contents.map((item: any) => ({
        key: item.id,
        ...item,
        slider: item.children?.find((child: any) => child.path === currentMenu) ? true : false
      }))
      sessionStorage.setItem('menu_list', JSON.stringify(contents))
      setMenuList(contents)
    }
    getMenuList()
  }, [currentMenu])
  return (
    <div className='flex h-screen'>
      {/* 侧边栏 - 设置 flex-shrink-0 防止被挤压 */}
      <div className='flex-shrink-0 border-slate-300 bg-gradient-to-b from-slate-100 to-blue-50 shadow-lg'>
        <BasicAside
          addTab={addTab}
          collapsed={collapsed}
          currentMenu={currentMenu}
          menuList={menuList}
          setCurrentMenu={setCurrentMenu}
          setMenuList={setMenuList}
          setTabs={setTabs}
          toggleCollapsed={toggleCollapsed}
        />
      </div>

      {/* 主内容区域 */}
      <div className='flex-1 flex flex-col min-w-0'>
        <BasicHeader
          collapsed={collapsed}
          theme={theme}
          toggleCollapsed={toggleCollapsed}
          toggleTheme={toggleTheme}
        />
        <BasicTabs addTab={addTab} currentMenu={currentMenu} menuList={menuList} removeTab={removeTab} tabs={tabs} />
        <div className='p-8px bg-#f5f5f5 flex-1 w-full overflow-x-hidden h-0 overflow-y-auto flex flex-col'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default BasicLayout
'use client'
import React, { useEffect, useState } from 'react'
import { Avatar, Popover, Modal, App } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutProps } from '@/types'
import { useAuth } from '@/hooks'
import AppIcon from '../ui/AppIcons'

const BasicAside = ({
  collapsed,
  menuList,
  currentMenu,
  setCurrentMenu,
  setMenuList,
  addTab
}: LayoutProps) => {
  const { modal } = App.useApp()
  const { userInfo, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [visble, setVisble] = useState(false)
  const onClick = (clickedItem: any) => {
    if (pathname === clickedItem.path) {
      return
    }
    if (clickedItem.children?.length) {
      setMenuList && setMenuList((prevItems: any[] = []) =>
        prevItems.map((item: any) =>
          item.id === clickedItem.id ? { ...item, slider: !item.slider } : item
        )
      )
    } else {
      setCurrentMenu && setCurrentMenu(clickedItem.path)
      addTab?.(clickedItem)
      router.push(clickedItem.path)
    }
  }
  const onUserClick = () => {
    setVisble(true)
  }
  const onLogout = () => {
    setVisble(false)
    modal.confirm({
      title: '退出登录',
      content: '确定要退出登录吗？',
      cancelText: '取消',
      okText: '确认退出',
      onOk: () => {
        logout()
      }
    })
  }
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // 检查点击是否在弹窗外部且不是触发按钮
      if (visble &&
        !target.closest('.user-popover') &&
        !target.closest('.user-popover-trigger')) {
        setVisble(false)
      }
    }

    if (visble) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [visble])
  // 子菜单
  const subContent = (item: any) => (
    item.children?.length ? (
      <div className='overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50 rounded-md mx-2 mb-1'>
        {item.children.map((child: any, index: number) => (
          <div
            key={`${child.id}-${index}`}
            className={`
              flex items-center min-w-0 px-3 py-2 cursor-pointer overflow-hidden whitespace-nowrap 
              transition-all duration-200 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600
              ${currentMenu === child.path
                ? 'bg-blue-100 text-blue-600 font-medium border-r-2 border-r-blue-500'
                : 'hover:bg-blue-50'
              }
              ${index === 0 ? 'rounded-t-md' : ''}
              ${index === item.children.length - 1 ? 'rounded-b-md' : ''}
            `}
            onClick={() => onClick(child)}
          >
            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2 flex-shrink-0" />
            <span className="truncate">{child.name}</span>
          </div>
        ))}
      </div>
    ) : null
  )

  return (
    <div className={`
      border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden h-full
      ${collapsed ? 'w-56 min-w-56' : 'w-14 min-w-14'}
    `}>
      {/* 用户头像区域 */}
      <div className='flex justify-between items-center px-2 py-3 relative'>
        {collapsed ? (
          <>
            <div className='user-popover-trigger flex items-center gap-2 hover:bg-gray-50 px-1.5 py-1.5 rounded-lg transition-all duration-200 min-w-0 group ' onClick={onUserClick}>
              <Avatar
                className="shadow-sm"
                icon={<UserOutlined />}
                size="small"
                style={{ backgroundColor: '#1890ff' }}
              />
              <div className="flex-1 min-w-0">
                <div className='text-xs font-semibold text-gray-800 truncate'>
                  {userInfo?.name}
                </div>
                <div className='text-xs text-gray-500 truncate'>
                  {userInfo?.username}
                </div>
              </div>
              <AppIcon
                className='text-gray-400 text-xs group-hover:text-gray-600 transition-colors duration-200'
                name="DownOutlined"
              />

            </div>
            <div className='hover:bg-gray-50 p-1.5 rounded-lg transition-all duration-200 group'>
              <AppIcon
                className='text-gray-500 group-hover:text-gray-700 transition-colors duration-200'
                name="BellOutlined"
              />
            </div>
            {visble && (
              <div className='user-popover absolute top-14 left-3.5 right-3.5 bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 flex flex-col items-center gap-3 text-gray-800 shadow-xl border border-gray-200 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-200'>
                {/* 用户头像 */}
                <div className='relative'>
                  <Avatar
                    className="shadow-lg ring-2 ring-blue-100"
                    icon={<UserOutlined />}
                    size="large"
                    style={{ backgroundColor: '#1890ff' }}
                  />
                  <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></div>
                </div>

                {/* 用户信息 */}
                <div className="flex-1 min-w-0 text-center space-y-1">
                  <div className='text-sm font-semibold text-gray-800 truncate'>
                    {userInfo?.name}
                  </div>
                  <div className='text-xs text-gray-500 truncate'>
                    {userInfo?.username}
                  </div>
                </div>

                {/* 分割线 */}
                <div className='w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>

                {/* 退出按钮 */}
                <div
                  className='flex items-center gap-2 px-3 py-2 text-xs cursor-pointer rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent transition-all duration-200 group w-full justify-center'
                  onClick={onLogout}
                >
                  <AppIcon
                    className='text-gray-500 group-hover:text-red-500 transition-colors duration-200'
                    name="LogoutOutlined"
                  />
                  <span className='font-medium'>退出登录</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className='flex flex-col items-center gap-1 w-full py-2'>
            <Avatar
              className="shadow-sm"
              icon={<UserOutlined />}
              size="small"
              style={{ backgroundColor: '#1890ff' }}
            />
          </div>
        )}
      </div>

      {/* 菜单区域 */}
      <div className='select-none py-1'>
        {menuList?.map((item: any, index: number) => (
          <div key={`${item.id}-${index}`} className='px-1 mb-0.5'>
            <div
              className={`
                flex items-center cursor-pointer overflow-hidden transition-all duration-200 rounded-lg group
                ${collapsed
                  ? 'gap-2 px-2 py-2 hover:bg-gray-50'
                  : 'justify-center px-1 py-2 hover:bg-gray-50'
                }
                ${currentMenu === item.path
                  ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-200'
                  : 'text-gray-700 hover:text-gray-900'
                }
              `}
              title={collapsed ? item.name : ''}
              onClick={() => onClick(item)}
            >
              {collapsed ? (
                <>
                  <span className="flex items-center shrink-0 text-sm">
                    <AppIcon
                      className={`
                        transition-colors duration-200
                        ${currentMenu === item.path ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                      `}
                      name={item.icon}
                    />
                  </span>
                  <span className='flex-1 truncate whitespace-nowrap text-xs font-medium'>
                    {item.name}
                  </span>
                  {item.children?.length ? (
                    <span className='transition-transform duration-200 group-hover:scale-110'>
                      <AppIcon
                        className='text-gray-400 text-xs'
                        name={item.slider ? "DownOutlined" : "RightOutlined"}
                      />
                    </span>
                  ) : null}
                </>
              ) : (
                <Popover
                  align={{ offset: [20, 0] }}
                  content={item.children?.length ? subContent(item) : item.name}
                  overlayClassName="menu-popover"
                  placement="right"
                >
                  <span className="flex items-center shrink-0 text-base">
                    <AppIcon
                      className={`
                        transition-colors duration-200
                        ${currentMenu === item.path ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                      `}
                      name={item.icon}
                    />
                  </span>
                </Popover>
              )}
            </div>

            {/* 子菜单 - 只在展开状态显示 */}
            {collapsed && item.slider && (
              <div className="mt-1">
                {subContent(item)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default BasicAside
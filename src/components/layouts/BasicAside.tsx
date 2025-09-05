'use client'
import React from 'react'
import { Avatar, Popover } from 'antd'
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
  const { userInfo } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  const onClick = (clickedItem: any) => {
    if (pathname === clickedItem.path) {
      return
    }
    if (clickedItem.children && clickedItem.children.length) {
      setMenuList && setMenuList((prevItems: any[] = []) =>
        prevItems.map((item: any) =>
          item.id === clickedItem.id ? { ...item, slider: !item.slider } : item
        )
      )
    } else {
      console.log(clickedItem.path)
      setCurrentMenu && setCurrentMenu(clickedItem.path)
      addTab?.(clickedItem)
      router.push(clickedItem.path)
    }
  }

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
      border-r border-gray-200 bg-white shadow-sm transition-all duration-300 ease-in-out overflow-hidden
      ${collapsed ? 'w-56 min-w-56' : 'w-14 min-w-14'}
    `}>
      {/* 用户头像区域 */}
      <div className='flex justify-between items-center px-2 py-3 border-b border-gray-100'>
        {collapsed ? (
          <>
            <div className='flex items-center gap-2 hover:bg-gray-50 px-1.5 py-1.5 rounded-lg transition-all duration-200 min-w-0 group'>
              <Avatar 
                size="small" 
                style={{ backgroundColor: '#1890ff' }} 
                icon={<UserOutlined />} 
                className="shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className='text-xs font-semibold text-gray-800 truncate'>
                  {userInfo?.name}
                </div>
                <div className='text-xs text-gray-500 truncate'>
                  管理员
                </div>
              </div>
              <AppIcon 
                name="DownOutlined" 
                className='text-gray-400 text-xs group-hover:text-gray-600 transition-colors duration-200' 
              />
            </div>
            <div className='hover:bg-gray-50 p-1.5 rounded-lg transition-all duration-200 group'>
              <AppIcon 
                name="BellOutlined" 
                className='text-gray-500 group-hover:text-gray-700 transition-colors duration-200' 
              />
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center gap-1 w-full py-2'>
            <Avatar 
              size="small" 
              style={{ backgroundColor: '#1890ff' }} 
              icon={<UserOutlined />} 
              className="shadow-sm"
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
              onClick={() => onClick(item)}
              title={collapsed ? item.name : ''}
            >
              {collapsed ? (
                <>
                  <span className="flex items-center shrink-0 text-sm">
                    <AppIcon 
                      name={item.icon} 
                      className={`
                        transition-colors duration-200
                        ${currentMenu === item.path ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                      `}
                    />
                  </span>
                  <span className='flex-1 truncate whitespace-nowrap text-xs font-medium'>
                    {item.name}
                  </span>
                  {item.children?.length ? (
                    <span className='transition-transform duration-200 group-hover:scale-110'>
                      <AppIcon 
                        name={item.slider ? "DownOutlined" : "RightOutlined"} 
                        className='text-gray-400 text-xs' 
                      />
                    </span>
                  ) : null}
                </>
              ) : (
                <Popover 
                  content={item.children?.length ? subContent(item) : item.name} 
                  align={{ offset: [20, 0] }} 
                  placement="right"
                  overlayClassName="menu-popover"
                >
                  <span className="flex items-center shrink-0 text-base">
                    <AppIcon 
                      name={item.icon} 
                      className={`
                        transition-colors duration-200
                        ${currentMenu === item.path ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                      `}
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
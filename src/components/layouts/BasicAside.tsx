'use client'
import React from 'react'
import { Avatar, Popover } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
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
  const onClick = (clickedItem: any) => {
    if (clickedItem.children && clickedItem.children.length) {
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
  // 子菜单
  const subContent = (item: any) => (
    item.children?.length ? (
    <div className='overflow-hidden transition-all duration-300 ease-in-out'>
      {item.children.map((child: any) => (
        <div
          key={child.id}
          className={`${collapsed ? 'pl-14' : ''} ${currentMenu === child.path ? 'bg-#e5f4ff' : ''} text-13px flex min-w-0 items-center hover:bg-gray/15 px-4 gap-4 h-32px cursor-pointer overflow-hidden whitespace-nowrap transition-all duration-200`}
          onClick={() => onClick(child)}
        >
          {child.name}
        </div>
      ))}
    </div>
  ) : null)
  return (
    <div className={`
      border-r-1 border-r-solid border-[#e6e6e6] py-1 transition-all duration-300 ease-in-out overflow-hidden bg-white
      ${collapsed ? 'w-54 min-w-54' : 'w-16 min-w-16'}
    `}>
      {/* 用户头像 */}
      <div className='flex justify-between items-center px-2 mb-4px'>
        {collapsed ? (
          <>
            <div className='flex items-center gap-2 hover:bg-gray/15 px-1.5 py-2 rounded-2px transition-all duration-200 min-w-0'>
              <Avatar size="small" style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
              <span className='text-sm  font-bold leading-none  min-w-0 truncate whitespace-nowrap opacity-100 transition-opacity duration-300'>{userInfo?.name}</span>
              <AppIcon name="DownOutlined" className='text-gray-500 text-6px opacity-100 transition-opacity duration-300' />
            </div>
            <span className='hover:bg-gray/15 px-1.5 py-2 rounded-2px transition-all duration-200'>
              <AppIcon name="BellOutlined" />
            </span>
          </>
        ) : (
          <div className='flex flex-col items-center gap-2 w-full overflow-hidden mt-6px mb-8px'>
            <Avatar size="small" style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
          </div>
        )}
      </div>
      {/* 菜单 */}
      <div className='select-none'>
        {menuList?.map((item: any) => (
          <div key={item.id} className='text-13px rounded-2px'>
            <div
              className={`flex min-w-0 items-center hover:bg-gray/15 cursor-pointer overflow-hidden transition-all duration-200 ${collapsed ? 'gap-4 px-4 h-32px' : 'justify-center px-2 h-12'
                } ${currentMenu === item.path ? 'bg-#e5f4ff' : ''}`}
              onClick={() => onClick(item)}
              title={collapsed ? item.name : ''}
            >
              {collapsed ? <span className="flex items-center shrink-0 text-12px">
                <AppIcon name={item.icon} />
              </span> : (
                <Popover content={item.children?.length ? subContent(item) : item.name} align={{ offset: [30, 10] }} placement="right">
                  <span className="flex items-center shrink-0 text-lg">
                    <AppIcon name={item.icon} />
                  </span>
                </Popover >
              )}
              {collapsed && (
                <>
                  <span className='leading-none flex-1 truncate whitespace-nowrap opacity-100 transition-opacity duration-300'>{item.name}</span>
                  {item.children?.length ? (
                    <span className='opacity-100 transition-opacity duration-300'>
                      {item.slider ? (
                        <AppIcon name="DownOutlined" className='text-gray-500 text-8px' />
                      ) : (
                        <AppIcon name="RightOutlined" className='text-gray-500 text-8px' />
                      )}
                    </span>
                  ) : null}
                </>
              )}
            </div>
            {/* 子菜单 - 只在展开状态显示 */}
            {collapsed && item.slider && (
              subContent(item)
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default BasicAside
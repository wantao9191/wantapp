'use client'
import React, { useEffect, useState } from 'react'
import { Tabs } from 'antd'
import { LayoutProps } from '@/types'
import { useRouter, usePathname } from 'next/navigation'
import { useSlider } from '@/hooks/useSlider'
const BasicTabs = ({ currentMenu, tabs, addTab, removeTab }: LayoutProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const [activeKey, setActiveKey] = useState(currentMenu)
  const [items, setItems] = useState<any[]>([])
  const { menuList } = useSlider()
  const clickTab = (key: string) => {
    const path = tabs?.find((tab: any) => tab.key === key)?.path
    router.push(path)
  }

  // 处理关闭tab的逻辑
  const handleRemoveTab = (tabKey: string,) => {
    // 判断是否为当前激活的tab
    const isCurrentTab = tabKey === activeKey
    if (isCurrentTab && tabs && tabs.length > 1) {
      // 找到当前tab在数组中的位置
      const currentIndex = tabs.findIndex((tab: any) => tab.key === tabKey)
      // 确定跳转目标
      let targetTab: any = null
      if (currentIndex === 0) {
        // 如果是第一个tab，跳转到下一个
        targetTab = tabs[1]
      } else if (currentIndex === tabs.length - 1) {
        // 如果是最后一个tab，跳转到前一个
        targetTab = tabs[currentIndex - 1]
      } else {
        // 如果是中间的tab，优先跳转到下一个
        targetTab = tabs[currentIndex + 1]
      }
      if (targetTab) {
        // 先跳转路由
        router.push(targetTab.path)
        // 更新activeKey
        setActiveKey(targetTab.key)
      }
    }
    // 移除tab
    removeTab?.(tabKey)
  }

  const resetItems = () => {
    const newItems = tabs?.map((tab: any) => {
      const {icon:_icon,...rest} = tab
      return {
        label: (
          <div className='flex items-center gap-2'>
            <span>{tab.name}</span>
          </div>
        ),
        ...rest
      }
    })
    return newItems
  }

  // 递归查找匹配路径的菜单项
  const findMenuItemByPath = (menuList: any[], targetPath: string): any => {
    for (const item of menuList) {
      if (item.path === targetPath) {
        return item
      }
      if (item.children && item.children.length > 0) {
        const found = findMenuItemByPath(item.children, targetPath)
        if (found) {
          return found
        }
      }
    }
    return null
  }

  useEffect(() => {
    if (currentMenu) {
      const newItems = resetItems()
      console.log(newItems)
      setItems(newItems as any)
      const foundItem = newItems?.find((item: any) => item.path === currentMenu)
      if (foundItem) {
        setActiveKey(foundItem.key)
      }
      //如果没有tabs，则从menuList中找到匹配当前路径的item
      if (!newItems || newItems.length === 0) {
        const defaultItem = findMenuItemByPath(menuList, pathname)
        if (defaultItem) {
          addTab?.(defaultItem)
        }
      }
    }
  }, [currentMenu, tabs])

  return (
    <div className='h-32px border-b-1 border-b-solid border-[#d9d9d9]'>
      <Tabs
        type="editable-card"
        hideAdd
        items={items}
        size="small"
        activeKey={activeKey}
        onChange={(key) => clickTab(key)}
        onEdit={(key) => handleRemoveTab(key as string)}
        className='h-full tabs-browser'
        tabBarStyle={{
          margin: 0,
          height: '32px',
          paddingLeft: '8px',
          paddingRight: '8px',
          borderBottom: 'none',
        }}
      />
    </div>
  )
}

export default BasicTabs
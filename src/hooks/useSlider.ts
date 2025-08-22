import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
export const useSlider = () => {
  const [collapsed, setCollapsed] = useState(true)
  const [currentMenu, setCurrentMenu] = useState('')
  const pathname = usePathname()
  const [menuList, setMenuList] = useState<any[]>([
    {
      key: '1',
      name: '首页',
      icon: 'HomeOutlined',
      slider: false,
      path: '/admin/index',
    },
    {
      key: '2',
      name: '系统管理',
      icon: 'UserOutlined',
      slider: false,
      path: '/admin/system',
      children: [
        {
          key: '2-1',
          name: '用户管理',
          path: '/admin/system/users',
        },
        {
          key: '2-2',
          name: '角色管理',
          path: '/admin/system/roles',
        },
        {
          key: '2-3',
          name: '权限管理',
          path: '/admin/system/permissions',
        },
        {
          key: '2-4',
          name: '菜单管理',
          path: '/admin/system/menus',
        },
        {
          key: '2-5',
          name: '机构管理',
          path: '/admin/system/organizations',
        },
      ]
    }
  ])

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  useEffect(() => {
    setCurrentMenu(pathname)
    setMenuList((prevItems: any[]) =>
      prevItems.map((item: any) => ({
        ...item,
        slider: item.children?.find((child: any) => child.path === pathname) ? true : false
      }))
    )
  }, [pathname])

  return { collapsed, toggleCollapsed, menuList, currentMenu, setCurrentMenu, setMenuList }
}

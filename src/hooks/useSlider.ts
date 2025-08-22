import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
export const useSlider = () => {
  const [collapsed, setCollapsed] = useState(true)
  const [currentMenu, setCurrentMenu] = useState('')
  const pathname = usePathname()
  const [menuList, setMenuList] = useState<any[]>([])

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  useEffect(() => {
    setCurrentMenu(pathname)  
  }, [pathname])

  return { collapsed, toggleCollapsed, menuList, currentMenu, setCurrentMenu, setMenuList }
}

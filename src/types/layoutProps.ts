export interface LayoutProps {
  collapsed?: boolean
  toggleCollapsed?: () => void
  menuList?: any[]
  currentMenu?: string
  setCurrentMenu?: (menu: string) => void
  setMenuList?: (menuList: any[] | ((prevItems: any[]) => any[])) => void
  tabs?: any[]
  addTab?: (tab: any) => void
  setTabs?: (tabs: any[] | ((prevItems: any[]) => any[])) => void
  removeTab?: (key: string) => void
}

export interface ThemeProps {
  theme: string
  toggleTheme: () => void
}
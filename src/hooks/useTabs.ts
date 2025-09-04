import { useEffect, useState } from "react"
export const useTabs = () => {
  const [tabs, setTabs] = useState<any[]>([])

  const addTab = (tab: any) => {
    if (!tabs.some((t: any) => t.id === tab.id)) {
      tab.key = tab.id
      const newTabs = [...tabs, tab]
      setTabs(newTabs)
      sessionStorage.setItem('nav_tabs', JSON.stringify(newTabs))
    }

  }
  const removeTab = (key: string) => {
    const newTabs = tabs?.filter((tab: any) => tab.key !== key)
    setTabs(newTabs)
    sessionStorage.setItem('nav_tabs', JSON.stringify(newTabs))
  }
  useEffect(() => {
    const sessionTabs = sessionStorage.getItem('nav_tabs')
    if (sessionTabs) {
      const tabValues = JSON.parse(sessionTabs)
      setTabs(tabValues)
    }
  }, [])


  return { tabs, setTabs, addTab, removeTab }
}
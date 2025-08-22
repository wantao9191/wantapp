import { useEffect, useState } from "react"
export const useTabs = () => {
  const [tabs, setTabs] = useState<any[]>([])
  const sessionTabs = sessionStorage.getItem('nav_tabs')
  const addTab = (tab: any) => {
    console.log(tab, 'tab')
    if (tabs.length > 1 && tabs.find((t: any) => t.key === tab.key)) {
      return
    }
    const newTabs = [...tabs, tab]
    setTabs(newTabs)
    console.log(newTabs, 'newTabs')
    sessionStorage.setItem('nav_tabs', JSON.stringify(newTabs))
  }
  const removeTab = (key: string) => {
    const newTabs = tabs?.filter((tab: any) => tab.key !== key)
    setTabs(newTabs)
    sessionStorage.setItem('nav_tabs', JSON.stringify(newTabs))
  }
  useEffect(() => {
    if (sessionTabs) {
      const tabValues = JSON.parse(sessionTabs)
      setTabs(tabValues)
    }
  }, [])


  return { tabs, setTabs, addTab, removeTab }
}
'use client'
import React, { useState, useEffect } from 'react'
import { Tree, Tabs, Spin, Card, App } from 'antd'
import { http } from '@/lib/https'
import type { DataNode } from 'antd/es/tree'

interface PermissionsProps {
  value?: {
    menus?: number[]
    permissions?: number[]
  }
  onChange?: (value: { menus: number[], permissions: number[] }) => void
  disabled?: boolean
}

interface MenuNode extends DataNode {
  id: number
  code: string
  parentCode?: string
  permissions?: PermissionItem[]
  children?: MenuNode[]
}

interface PermissionItem {
  id: number
  name: string
  code: string
  menuId: number
}

const Permissions: React.FC<PermissionsProps> = ({ 
  value = { menus: [], permissions: [] }, 
  onChange, 
  disabled = false 
}) => {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [menuTree, setMenuTree] = useState<MenuNode[]>([])
  const [permissionList, setPermissionList] = useState<PermissionItem[]>([])
  const [activeTab, setActiveTab] = useState('menus')

  // 获取菜单数据
  const fetchMenus = async () => {
    try {
      const response = await http.get('/admin/menus', { 
        page: 1, 
        pageSize: 1000
        // 不传noParent参数，获取树形结构的菜单数据
      })
      return response.data || []
    } catch (error) {
      message.error('获取菜单数据失败')
      return []
    }
  }

  // 获取权限数据
  const fetchPermissions = async () => {
    try {
      const response = await http.get('/admin/permissions', { 
        page: 1, 
        pageSize: 1000 
      })
      return response.data || []
    } catch (error) {
      message.error('获取权限数据失败')
      return []
    }
  }


  // 将菜单数据转换为树节点格式，并添加权限节点
  const convertMenusToTree = (menus: any[], permissions: PermissionItem[]): MenuNode[] => {
    const convertNode = (menu: any): MenuNode => {
      const menuPermissions = permissions.filter(p => p.menuId === menu.id)
      
      const node: MenuNode = {
        key: `menu_${menu.id}`,
        title: menu.name,
        id: menu.id,
        code: menu.code,
        parentCode: menu.parentCode,
        permissions: menuPermissions,
        children: []
      }
      
      // 处理子菜单
      if (menu.children && menu.children.length > 0) {
        node.children = menu.children.map(convertNode)
      }
      
      // 添加权限节点
      if (menuPermissions.length > 0) {
        const permissionNodes: MenuNode[] = menuPermissions.map(permission => ({
          key: `permission_${permission.id}`,
          title: permission.name,
          id: permission.id,
          code: permission.code,
          isLeaf: true
        }))
        
        node.children = [...(node.children || []), ...permissionNodes]
      }
      
      return node
    }
    
    return menus.map(convertNode)
  }

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      setLoading(true)
      try {
        const [menus, permissions] = await Promise.all([
          fetchMenus(),
          fetchPermissions()
        ])
        
        setPermissionList(permissions)
        const tree = convertMenusToTree(menus, permissions)
        setMenuTree(tree)
      } catch (error) {
        message.error('初始化数据失败')
      } finally {
        setLoading(false)
      }
    }

    initData()
  }, [])

  // 处理菜单选择变化
  const handleMenuCheck = (checkedKeys: any) => {
    const menuIds: number[] = []
    const permissionIds: number[] = []
    
    checkedKeys.forEach((key: string) => {
      if (key.startsWith('menu_')) {
        menuIds.push(parseInt(key.replace('menu_', '')))
      } else if (key.startsWith('permission_')) {
        permissionIds.push(parseInt(key.replace('permission_', '')))
      }
    })
    
    onChange?.({
      menus: menuIds,
      permissions: permissionIds
    })
  }

  // 处理权限选择变化
  const handlePermissionCheck = (checkedKeys: any) => {
    const permissionIds: number[] = []
    
    checkedKeys.forEach((key: string) => {
      if (key.startsWith('permission_')) {
        permissionIds.push(parseInt(key.replace('permission_', '')))
      }
    })
    
    onChange?.({
      menus: value.menus || [],
      permissions: permissionIds
    })
  }

  // 获取已选中的菜单键
  const getCheckedMenuKeys = () => {
    const keys: string[] = []
    if (value.menus) {
      keys.push(...value.menus.map(id => `menu_${id}`))
    }
    if (value.permissions) {
      keys.push(...value.permissions.map(id => `permission_${id}`))
    }
    return keys
  }

  // 获取已选中的权限键
  const getCheckedPermissionKeys = () => {
    return (value.permissions || []).map(id => `permission_${id}`)
  }

  // 构建纯权限树
  const buildPermissionTree = (): MenuNode[] => {
    return permissionList.map(permission => ({
      key: `permission_${permission.id}`,
      title: permission.name,
      id: permission.id,
      code: permission.code,
      isLeaf: true
    }))
  }

  const tabItems = [
    {
      key: 'menus',
      label: '菜单权限',
      children: (
        <Card size="small" className="min-h-300px">
          <Tree
            checkable
            disabled={disabled}
            treeData={menuTree}
            checkedKeys={getCheckedMenuKeys()}
            onCheck={handleMenuCheck}
            defaultExpandAll
            showLine
            className="max-h-400px overflow-auto"
          />
        </Card>
      )
    },
    {
      key: 'permissions',
      label: '功能权限',
      children: (
        <Card size="small" className="min-h-300px">
          <Tree
            checkable
            disabled={disabled}
            treeData={buildPermissionTree()}
            checkedKeys={getCheckedPermissionKeys()}
            onCheck={handlePermissionCheck}
            defaultExpandAll
            className="max-h-400px overflow-auto"
          />
        </Card>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-200px">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="permissions-selector">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
      />
    </div>
  )
}

export default Permissions
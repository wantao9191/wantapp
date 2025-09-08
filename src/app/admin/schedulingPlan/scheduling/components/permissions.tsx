'use client'
import React, { useState, useEffect } from 'react'
import { Spin, Checkbox } from 'antd'
import { http } from '@/lib/https'
import type { DataNode } from 'antd/es/tree'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
interface PermissionsProps {
  value?: {
    menus?: number[]
    permissions?: number[]
  }
  onChange?: (value: { menus: number[], permissions: number[] }) => void
  disabled?: boolean
  [key: string]: any // 允许其他属性
}

interface MenuNode extends DataNode {
  id: number
  code: string
  parentCode?: string
  permissions?: PermissionItem[]
  children?: MenuNode[]
  name?: string
  indeterminate?: boolean
  checkAll?: boolean
  checkedList?: number[]
}

interface PermissionItem {
  id: number
  name: string
  code: string
  menuId: number
  label: string;
  value: number;
}

const fetchMenuPermissions = async () => {
  const [menus, permissions] = await Promise.all([
    http.get('/admin/menus/dicts'),
    http.get('/admin/permissions/dicts')
  ])
  return { menus, permissions }
}

const Permissions: React.FC<PermissionsProps> = (props) => {
  const { onChange, value } = props
  const [loading, setLoading] = useState(false)
  const [menuTree, setMenuTree] = useState<MenuNode[]>([])
  const [initFlag, setInitFlag] = useState(false)
  const CheckboxGroup = Checkbox.Group
  // 初始化
  const init = async (propsPermissions: number[]) => {
    try {
      setLoading(true)
      const { menus, permissions } = await fetchMenuPermissions()
      const trees = menus.data.contents.map((menu: MenuNode) => {
        if (menu.children && menu.children.length) {
          menu.children.map((child: MenuNode) => {
            child.permissions = permissions.data.contents
              .filter((permission: PermissionItem) => permission.menuId === child.id)
              .map((permission: PermissionItem) => ({
                label: permission.name,
                value: permission.id
              }))
            child.checkedList = propsPermissions.filter((permission: number) => child.permissions?.find((p: PermissionItem) => p.value === permission))
            child.checkAll = child.checkedList.length === (child.permissions?.length || 0)
            child.indeterminate = child.checkedList.length > 0 && child.checkedList.length < (child.permissions?.length || 0)
            return child
          })
        }
        menu.permissions = permissions.data.contents
          .filter((permission: PermissionItem) => permission.menuId === menu.id)
          .map((permission: PermissionItem) => ({
            label: permission.name,
            value: permission.id
          }))
        const hasCheckedList = menu.children?.filter(child => child.checkedList?.length ?? 0 > 0)
        return {
          ...menu,
          label: menu.name,
          value: menu.id,
          checkAll: menu.children?.every(child => child.checkAll),
          indeterminate: menu.children?.filter(child => child.checkAll).length !== menu.children?.length
            && (hasCheckedList?.length ?? 0) > 0
        }
      })
      setMenuTree(trees)
      setLoading(false)
    } catch (error) {
    }

  }
  // 父级菜单change
  const onCheckAllChange = (e: CheckboxChangeEvent, menu: MenuNode) => {
    setMenuTree(menuTree.map((item: MenuNode) => {
      if (item.id === menu.id) {
        item.children?.map((child: MenuNode) => {
          child.checkAll = e.target.checked
          child.checkedList = e.target.checked ? child.permissions?.map((permission: PermissionItem) => permission.value) || [] : []
        })
        return { ...item, checkAll: e.target.checked }
      }
      return item
    }))
  };
  // 子级菜单change
  const handleChange = (e: any, targetMenu: MenuNode) => {
    const updateMenuTree = (menus: MenuNode[]): MenuNode[] => {
      return menus.map((item: MenuNode) => {
        // 如果找到目标菜单，直接更新
        if (item.id === targetMenu.id) {
          return {
            ...item,
            checkAll: e.target.checked,
            checkedList: e.target.checked ? item.permissions?.map((permission: PermissionItem) => permission.value) || [] : []
          }
        }
        // 如果有子菜单，递归查找
        if (item.children && item.children.length > 0) {
          const updatedChildren = updateMenuTree(item.children)
          // 检查是否有子菜单被更新
          const hasUpdatedChild = updatedChildren.some(child => child.id === targetMenu.id)
          if (hasUpdatedChild) {
            const checkAll = updatedChildren?.every(child => child.checkAll)
            const indeterminate = updatedChildren?.filter(child => child.checkAll).length !== updatedChildren?.length
            return {
              ...item,
              children: updatedChildren,
              indeterminate,
              checkAll
            }
          }
        }
        return item
      })
    }
    setMenuTree(updateMenuTree(menuTree))
  }
  // 权限项change
  const handleCheckboxChange = (e: any, targetMenu: MenuNode) => {
    const updateMenuTree = (menus: MenuNode[]): MenuNode[] => {
      return menus.map((item: MenuNode) => {
        // 如果找到目标菜单，直接更新
        if (item.id === targetMenu.id) {
          const length = item.permissions?.length || 0
          return {
            ...item,
            checkAll: e.length === length,
            checkedList: e,
            indeterminate: e.length > 0 && e.length < length,
          }
        }
        // 如果有子菜单，递归查找
        if (item.children && item.children.length > 0) {
          const updatedChildren = updateMenuTree(item.children)
          // 检查是否有子菜单被更新
          const hasUpdatedChild = updatedChildren.some(child => child.id === targetMenu.id)
          if (hasUpdatedChild) {
            const checkAll = updatedChildren.every(child => (child.checkedList?.length || 0) === (child.permissions?.length || 0))
            const indeterminate = updatedChildren.some(child => (child.checkedList?.length || 0) > 0) && !checkAll
            return {
              ...item,
              children: updatedChildren,
              checkAll,
              indeterminate,
            }
          }
        }
        return item
      })
    }
    setMenuTree(updateMenuTree(menuTree))
  }
  // 收集数据
  const collectSelectedData = (menuTree: MenuNode[]) => {
    const selectedMenus: number[] = []
    const selectedPermissions: number[] = []
    const traverse = (nodes: MenuNode[]) => {
      nodes.forEach(node => {
        // 记录checkAll或indeterminate为true的菜单
        if (node.checkAll || node.indeterminate) {
          selectedMenus.push(node.id)
        }
        // 如果有permissions且有checkedList，记录权限数据
        if (node.permissions && node.checkedList && node.checkedList.length > 0) {
          selectedPermissions.push(...node.checkedList)
        }
        // 递归处理子节点
        if (node.children && node.children.length > 0) {
          traverse(node.children)
        }
      })
    }
    traverse(menuTree)
    return {
      menus: selectedMenus,
      permissions: selectedPermissions
    }
  }
  useEffect(() => {
    if (value && !initFlag) {
      const permissions = value?.permissions || []
      init(permissions)
      setInitFlag(true)
    }
  }, [value])
  useEffect(() => {
    if (menuTree.length > 0 && initFlag) {
      const { menus, permissions } = collectSelectedData(menuTree)
      onChange?.({ menus, permissions })
    }
  }, [menuTree, initFlag])

  return (
    <Spin spinning={loading} tip="加载权限数据中...">
      <div className="flex flex-col bg-#fff rounded-4px p-12px">
        {menuTree.map((menu: MenuNode) => (
          <div key={menu.id}>
            <div className='flex'>
              <Checkbox indeterminate={menu.indeterminate} onChange={(e) => onCheckAllChange(e, menu)} checked={menu.checkAll}>
                {menu.name}
              </Checkbox>
            </div>
            <div className='flex flex-col ml-24px mt-6px'>
              {menu?.children?.map((child: MenuNode, index: number) => (
                <div key={child.id}>
                  <div className={`${index === 0 ? '' : 'mt-6px'}`}>
                    <Checkbox indeterminate={child.indeterminate} value={child.id} onChange={(e) => handleChange(e, child)} checked={child.checkAll}>
                      {child.name}
                    </Checkbox>
                  </div>
                  <div className='mt-6px ml-24px'>
                    <CheckboxGroup
                      options={child.permissions?.map(p => ({ label: p.label, value: p.value })) || []}
                      value={child.checkedList} onChange={(e) => handleCheckboxChange(e, child)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Spin>
  )
}

export default Permissions
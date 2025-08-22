import { db } from '../src/db/index'
import { menus } from '../src/db/schema'

// 菜单数据结构接口
interface MenuData {
  name: string
  code: string
  parentId?: number | null
  parentCode?: string // 父菜单的code，用于查找父菜单ID
  path?: string
  icon?: string
  sort?: number
  description?: string
  status?: number
}

// 默认菜单数据
const defaultMenus: MenuData[] = [
  // 首页
  {
    name: '首页',
    code: 'home',
    path: '/admin/index',
    icon: 'HomeOutlined',
    sort: 1,
    description: '系统首页',
    status: 1
  },
  // 系统管理
  {
    name: '系统管理',
    code: 'system',
    path: '/admin/system',
    icon: 'SettingOutlined',
    sort: 2,
    description: '系统管理模块',
    status: 1
  },
  // 系统管理子菜单
  {
    name: '用户管理',
    code: 'system_users',
    parentCode: 'system', // 指定父菜单的code，用于查找父菜单ID
    path: '/admin/system/users',
    icon: 'UserOutlined',
    sort: 1,
    description: '用户管理',
    status: 1
  },
  {
    name: '角色管理',
    code: 'system_roles',
    parentCode: 'system', // 指定父菜单的code，用于查找父菜单ID
    path: '/admin/system/roles',
    icon: 'TeamOutlined',
    sort: 2,
    description: '角色管理',
    status: 1
  },
  {
    name: '权限管理',
    code: 'system_permissions',
    parentCode: 'system', // 指定父菜单的code，用于查找父菜单ID
    path: '/admin/system/permissions',
    icon: 'SafetyCertificateOutlined',
    sort: 3,
    description: '权限管理',
    status: 1
  },
  {
    name: '菜单管理',
    code: 'system_menus',
    parentCode: 'system', // 指定父菜单的code，用于查找父菜单ID
    path: '/admin/system/menus',
    icon: 'MenuOutlined',
    sort: 4,
    description: '菜单管理',
    status: 1
  },
  {
    name: '机构管理',
    code: 'system_organizations',
    parentCode: 'system', // 指定父菜单的code，用于查找父菜单ID
    path: '/admin/system/organizations',
    icon: 'BankOutlined',
    sort: 5,
    description: '机构管理',
    status: 1
  }
]

/**
 * 批量插入菜单数据
 * @param menuData 菜单数据数组
 */
export async function insertMenus(menuData: MenuData[] = defaultMenus) {
  try {
    console.log('开始插入菜单数据...')
    
    // 清空现有菜单数据（避免重复插入）
    await db.delete(menus)
    console.log('🗑️ 已清空现有菜单数据')
    
    // 先插入父级菜单（没有parentCode的菜单）
    const parentMenus = menuData.filter(menu => !menu.parentCode)
    const insertedParentMenus: { id: number; code: string }[] = []
    
    for (const menu of parentMenus) {
      const result = await db.insert(menus).values({
        name: menu.name,
        code: menu.code,
        path: menu.path,
        icon: menu.icon,
        sort: menu.sort || 0,
        description: menu.description,
        status: menu.status || 1
      }).returning()
      
      insertedParentMenus.push({ id: result[0].id, code: result[0].code })
      console.log(`✅ 插入父菜单: ${menu.name} (ID: ${result[0].id})`)
    }
    
    // 插入子菜单
    const childMenus = menuData.filter(menu => menu.parentCode !== undefined)
    
    for (const menu of childMenus) {
      // 根据parentCode查找父菜单ID
      const parentMenu = insertedParentMenus.find(p => p.code === menu.parentCode)
      if (parentMenu) {
        const result = await db.insert(menus).values({
          name: menu.name,
          code: menu.code,
          parentCode: menu.parentCode,
          path: menu.path,
          icon: menu.icon,
          sort: menu.sort || 0,
          description: menu.description,
          status: menu.status || 1
        }).returning()
        
        console.log(`✅ 插入子菜单: ${menu.name} (ID: ${result[0].id}, 父菜单ID: ${parentMenu.id})`)
      } else {
        console.warn(`⚠️ 未找到父菜单: ${menu.parentCode}，跳过子菜单: ${menu.name}`)
      }
    }
    
    console.log('🎉 菜单数据插入完成！')
    
    // 返回插入结果
    const allMenus = await db.select().from(menus).orderBy(menus.sort)
    return allMenus
    
  } catch (error) {
    console.error('❌ 插入菜单数据失败:', error)
    throw error
  }
}

/**
 * 根据自定义数组插入菜单
 * @param customMenus 自定义菜单数组
 */
export async function insertCustomMenus(customMenus: MenuData[]) {
  return await insertMenus(customMenus)
}

/**
 * 插入单个菜单
 * @param menu 菜单数据
 */
export async function insertSingleMenu(menu: MenuData) {
  try {
    const result = await db.insert(menus).values({
      name: menu.name,
      code: menu.code,
      parentCode: menu.parentCode,
      path: menu.path,
      icon: menu.icon,
      sort: menu.sort || 0,
      description: menu.description,
      status: menu.status || 1
    }).returning()
    
    console.log(`✅ 插入菜单成功: ${menu.name} (ID: ${result[0].id})`)
    return result[0]
    
  } catch (error) {
    console.error('❌ 插入菜单失败:', error)
    throw error
  }
}

/**
 * 查询所有菜单（树形结构）
 */
export async function getMenuTree() {
  try {
    const allMenus = await db.select().from(menus).orderBy(menus.sort)
    
    // 构建树形结构
    const menuMap = new Map()
    const rootMenus: any[] = []
    
    // 先创建所有菜单的映射
    allMenus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] })
    })
    
    // 构建父子关系
    allMenus.forEach(menu => {
      if (menu.parentCode) {
        // 根据parentCode查找父菜单
        const parent = Array.from(menuMap.values()).find(p => p.code === menu.parentCode)
        if (parent) {
          parent.children.push(menuMap.get(menu.id))
        }
      } else {
        rootMenus.push(menuMap.get(menu.id))
      }
    })
    
    return rootMenus
    
  } catch (error) {
    console.error('❌ 查询菜单树失败:', error)
    throw error
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  insertMenus()
    .then(() => {
      console.log('脚本执行完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('脚本执行失败:', error)
      process.exit(1)
    })
}

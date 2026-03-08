/**
 * 动态菜单配置
 * 根据用户类型(user_type)和系统角色动态生成菜单
 */

import { SYSTEM_ROLE } from '@/constants'
import { USER_TYPE_ENUM } from '@/constants/enums'

// 菜单项接口定义
export interface MenuItem {
  index: string
  title: string
  icon: string
  path?: string
  children?: MenuItem[]
  permission?: string | string[] // 权限标识
  userType?: string[] // 允许的用户类型
  systemRole?: string[] // 允许的系统角色
  show?: boolean // 是否显示（可用于运行时控制）
}

// 菜单配置
export const menuConfig: MenuItem[] = [
  {
    index: 'welcome',
    title: '欢迎页',
    icon: 'House',
    path: '/welcome',
    userType: [USER_TYPE_ENUM.STUDENT, USER_TYPE_ENUM.TEACHER, USER_TYPE_ENUM.ADMIN]
  },
  {
    index: 'user-management',
    title: '用户管理',
    icon: 'User',
    userType: [USER_TYPE_ENUM.ADMIN],
    children: [
      {
        index: 'user-list',
        title: '用户列表',
        icon: 'List',
        path: '/user/list'
      }
    ]
  },
  {
    index: 'topic-management',
    title: '课题管理',
    icon: 'FolderOpened',
    userType: [USER_TYPE_ENUM.STUDENT, USER_TYPE_ENUM.TEACHER, USER_TYPE_ENUM.ADMIN],
    children: [
      {
        index: 'topic-list',
        title: '课题列表',
        icon: 'List',
        path: '/topic/list'
      }
    ]
  },
  {
    index: 'selection-management',
    title: '选题管理',
    icon: 'Collection',
    userType: [USER_TYPE_ENUM.STUDENT, USER_TYPE_ENUM.TEACHER, USER_TYPE_ENUM.ADMIN],
    children: [
      {
        index: 'selection-list',
        title: '选题列表',
        icon: 'List',
        path: '/selection/list'
      }
    ]
  },
  {
    index: 'document-management',
    title: '文档管理',
    icon: 'Document',
    userType: [USER_TYPE_ENUM.STUDENT, USER_TYPE_ENUM.TEACHER, USER_TYPE_ENUM.ADMIN],
    children: [
      {
        index: 'document-list',
        title: '文档列表',
        icon: 'List',
        path: '/document/list'
      }
    ]
  },
  {
    index: 'grade-management',
    title: '成绩管理',
    icon: 'Star',
    userType: [USER_TYPE_ENUM.TEACHER, USER_TYPE_ENUM.ADMIN],
    children: [
      {
        index: 'grade-list',
        title: '成绩列表',
        icon: 'List',
        path: '/grade/list'
      }
    ]
  },
  {
    index: 'department-management',
    title: '院系管理',
    icon: 'OfficeBuilding',
    userType: [USER_TYPE_ENUM.ADMIN],
    children: [
      {
        index: 'department-list',
        title: '院系列表',
        icon: 'List',
        path: '/department/list'
      }
    ]
  },
  {
    index: 'notice-management',
    title: '公告管理',
    icon: 'Bell',
    userType: [USER_TYPE_ENUM.ADMIN],
    children: [
      {
        index: 'notice-list',
        title: '公告列表',
        icon: 'Document',
        path: '/notice/list'
      }
    ]
  }
]

// 根据用户信息过滤菜单
export function filterMenusByUser(menus: MenuItem[], userInfo: any): MenuItem[] {
  if (!userInfo) return []
  
  const { userType, systemRoles = [] } = userInfo
  
  return menus.filter(menu => {
    // 检查用户类型权限
    if (menu.userType && !menu.userType.includes(userType)) {
      return false
    }
    
    // 检查系统角色权限
    if (menu.systemRole && !menu.systemRole.some(role => systemRoles.includes(role))) {
      return false
    }
    
    // 检查自定义权限标识
    if (menu.permission) {
      const permissions = Array.isArray(menu.permission) ? menu.permission : [menu.permission]
      const userPermissions = userInfo.permissions || []
      if (!permissions.some(perm => userPermissions.includes(perm))) {
        return false
      }
    }
    
    // 递归处理子菜单
    if (menu.children && menu.children.length > 0) {
      menu.children = filterMenusByUser(menu.children, userInfo)
      // 如果子菜单为空，则不显示该菜单项
      if (menu.children.length === 0) {
        return false
      }
    }
    
    return true
  })
}

// 获取扁平化的菜单路径（用于路由权限检查）
export function getMenuPaths(menus: MenuItem[]): string[] {
  const paths: string[] = []
  
  function traverse(menuItems: MenuItem[]) {
    menuItems.forEach(item => {
      if (item.path) {
        paths.push(item.path)
      }
      if (item.children) {
        traverse(item.children)
      }
    })
  }
  
  traverse(menus)
  return paths
}

// 根据索引查找菜单项
export function findMenuItem(menus: MenuItem[], index: string): MenuItem | null {
  for (const menu of menus) {
    if (menu.index === index) {
      return menu
    }
    if (menu.children) {
      const found = findMenuItem(menu.children, index)
      if (found) {
        return found
      }
    }
  }
  return null
}

// 获取用户可访问的顶级菜单
export function getTopLevelMenus(userInfo: any): MenuItem[] {
  const filteredMenus = filterMenusByUser([...menuConfig], userInfo)
  return filteredMenus.map(menu => ({
    ...menu,
    children: undefined // 只返回顶层菜单，不包含子菜单
  }))
}

// 获取特定菜单的子菜单
export function getSubMenuItems(parentIndex: string, userInfo: any): MenuItem[] {
  const parentMenu = findMenuItem(menuConfig, parentIndex)
  if (!parentMenu || !parentMenu.children) {
    return []
  }
  return filterMenusByUser([...parentMenu.children], userInfo)
}
/**
 * 动态菜单配置
 * 根据用户类型 (user_type) 和系统角色动态生成菜单
 */

import { USER_TYPE_ENUM } from '@/constants/enums'
import type { MenuItem } from '@/directives/permission'

// 菜单配置
export const menuConfig: MenuItem[] = [

  /**
   * 学生菜单
  */
  {
    index: 'dashboard',
    title: '仪表盘',
    icon: 'DataBoard',
    path: '/dashboard',
    userType: [
      USER_TYPE_ENUM.STUDENT
    ],
  },
  {
    index: 'topic-management',
    title: '课题',
    icon: 'FolderOpened',
    userType: [
      USER_TYPE_ENUM.STUDENT
    ],
    children: [
      {
        index: 'topic-list',
        title: '课题信息',
        icon: 'List',
        path: '/topic/list',
      },
      {
        index: 'selection-list',
        title: '选题信息',
        icon: 'List',
        path: '/selection/list',
      },
    ],
  },
  {
    index: 'process-management',
    title: '进程管理',
    icon: 'Process',
    userType: [
      USER_TYPE_ENUM.STUDENT
    ],
    children: [
      {
        index: 'opening-statement',
        title: '开题报告',
        icon: 'List',
        path: '/document/list?type=0',
      },
      {
        index: 'mid-term-report',
        title: '中期报告',
        icon: 'List',
        path: '/document/list?type=1',
      },
      {
        index: 'graduation-paper',
        title: '毕业论文',
        icon: 'List',
        path: '/document/list?type=2',
      }
    ],
  },
  


  /**
   * 教师菜单
  */
  {
    index: 'dashboard',
    title: '仪表盘',
    icon: 'DataBoard',
    path: '/dashboard',
    userType: [
      USER_TYPE_ENUM.TEACHER
    ],
  },
  {
    index: 'user-list',
    title: '我的学生',
    icon: 'List',
    path: '/user/list',
    userType: [
      USER_TYPE_ENUM.TEACHER
    ],
  },
  {
    index: 'topic-management',
    title: '课题管理',
    icon: 'FolderOpened',
    userType: [
      USER_TYPE_ENUM.TEACHER
    ],
    children: [
      {
        index: 'topic-list',
        title: '我的课题',
        icon: 'List',
        path: '/topic/list',
      },
    ],
  },
  {
    index: 'review-management',
    title: '我的审核',
    icon: 'Review',
    userType: [
      USER_TYPE_ENUM.TEACHER
    ],
    children: [
      {
        index: 'selection-list',
        title: '学生选题',
        icon: 'List',
        path: '/selection/list',
      },
      {
        index: 'opening-statement',
        title: '开题报告',
        icon: 'List',
        path: '/document/list?type=0',
      },
      {
        index: 'mid-term-report',
        title: '中期报告',
        icon: 'List',
        path: '/document/list?type=1',
      },
      {
        index: 'graduation-paper',
        title: '毕业论文',
        icon: 'List',
        path: '/document/list?type=2',
      }
    ],
  },

  /**
   * 院系管理员菜单
  */
  {
    index: 'dashboard',
    title: '仪表盘',
    icon: 'DataBoard',
    path: '/dashboard',
    userType: [
      USER_TYPE_ENUM.DEPARTMENT_ADMIN
    ],
  },
  {
    index: 'user-management',
    title: '用户管理',
    icon: 'User',
    userType: [
      USER_TYPE_ENUM.DEPARTMENT_ADMIN
    ],
    children: [
      {
        index: 'user-list',
        title: '用户列表',
        icon: 'List',
        path: '/user/list',
      },
    ],
  },
  {
    index: 'topic-management',
    title: '课题管理',
    icon: 'FolderOpened',
    userType: [
      USER_TYPE_ENUM.DEPARTMENT_ADMIN
    ],
    children: [
      {
        index: 'topic-list',
        title: '课题列表',
        icon: 'List',
        path: '/topic/list',
      },
    ],
  },
  {
    index: 'selection-management',
    title: '选题管理',
    icon: 'Collection',
    userType: [
      USER_TYPE_ENUM.DEPARTMENT_ADMIN,
    ],
    children: [
      {
        index: 'selection-list',
        title: '选题列表',
        icon: 'List',
        path: '/selection/list',
      },
    ],
  },
  {
    index: 'document-management',
    title: '文档管理',
    icon: 'Document',
    userType: [
      USER_TYPE_ENUM.DEPARTMENT_ADMIN
    ],
    children: [
      {
        index: 'opening-statement',
        title: '开题报告',
        icon: 'List',
        path: '/document/list?type=0',
      },
      {
        index: 'mid-term-report',
        title: '中期报告',
        icon: 'List',
        path: '/document/list?type=1',
      },
      {
        index: 'graduation-paper',
        title: '毕业论文',
        icon: 'List',
        path: '/document/list?type=2',
      }
    ],
  },


  /**
   * 系统管理员菜单菜单
  */
  {
    index: 'dashboard',
    title: '仪表盘',
    icon: 'DataBoard',
    path: '/dashboard',
    userType: [
      USER_TYPE_ENUM.SYSTEM_ADMIN
    ],
  },
  {
    index: 'user-management',
    title: '用户管理',
    icon: 'User',
    userType: [
      USER_TYPE_ENUM.SYSTEM_ADMIN
    ],
    children: [
      {
        index: 'user-list',
        title: '用户列表',
        icon: 'List',
        path: '/user/list',
      },
    ],
  },
  {
    index: 'department-management',
    title: '院系管理',
    icon: 'OfficeBuilding',
    userType: [
      USER_TYPE_ENUM.SYSTEM_ADMIN
    ],
    children: [
      {
        index: 'department-list',
        title: '院系列表',
        icon: 'List',
        path: '/department/list',
      },
    ],
  },
  {
    index: 'topic-management',
    title: '课题管理',
    icon: 'FolderOpened',
    userType: [
      USER_TYPE_ENUM.SYSTEM_ADMIN
    ],
    children: [
      {
        index: 'topic-list',
        title: '课题列表',
        icon: 'List',
        path: '/topic/list',
      },
    ],
  },
  {
    index: 'selection-management',
    title: '选题管理',
    icon: 'Collection',
    userType: [
      USER_TYPE_ENUM.SYSTEM_ADMIN
    ],
    children: [
      {
        index: 'selection-list',
        title: '选题列表',
        icon: 'List',
        path: '/selection/list',
      },
    ],
  },
  {
    index: 'document-management',
    title: '文档管理',
    icon: 'Document',
    userType: [
      USER_TYPE_ENUM.SYSTEM_ADMIN
    ],
    children: [
      {
        index: 'document-list',
        title: '文档列表',
        icon: 'List',
        path: '/document/list',
      },
    ],
  },



  //暂不优化的菜单
  {
    index: 'grade-management',
    title: '成绩管理',
    icon: 'Star',
    userType: [
      USER_TYPE_ENUM.TEACHER,
      USER_TYPE_ENUM.SYSTEM_ADMIN,
      USER_TYPE_ENUM.DEPARTMENT_ADMIN,
    ],
    children: [
      {
        index: 'grade-list',
        title: '成绩列表',
        icon: 'List',
        path: '/grade/list',
      },
    ],
  },
  {
    index: 'notice-management',
    title: '公告管理',
    icon: 'Bell',
    userType: [
      USER_TYPE_ENUM.SYSTEM_ADMIN,
      USER_TYPE_ENUM.DEPARTMENT_ADMIN,
    ],
    children: [
      {
        index: 'notice-list',
        title: '公告列表',
        icon: 'Document',
        path: '/notice/list',
      },
    ],
  },
]

// 复用 permission.ts 中的权限检查逻辑
import { checkPermissionAdvanced, type PermissionConfig } from '@/directives/permission'
import { User } from '@element-plus/icons-vue'

// 根据用户信息过滤菜单
export function filterMenusByUser(menus: MenuItem[], userInfo: any): MenuItem[] {
  if (!userInfo) return []

  return menus.filter((menu) => {
    // 复用已有的权限检查函数
    const hasPermission = checkMenuPermission(menu, userInfo)
    if (!hasPermission) {
      return false
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

/**
 * 检查菜单权限（复用 permission.ts 中的逻辑）
 */
function checkMenuPermission(menu: MenuItem, userInfo: any): boolean {
  const { userType, systemRoles = [], permissions = [] } = userInfo

  // 检查用户类型权限
  if (menu.userType && menu.userType.length > 0) {
    const config: PermissionConfig = {
      mode: 'userType',
      permissions: menu.userType,
      operator: 'OR'
    }
    if (!checkPermissionAdvanced(config, userInfo)) {
      return false
    }
  }

  // 检查系统角色权限
  if (menu.systemRole && menu.systemRole.length > 0) {
    const config: PermissionConfig = {
      mode: 'systemRole',
      permissions: menu.systemRole,
      operator: 'OR'
    }
    if (!checkPermissionAdvanced(config, userInfo)) {
      return false
    }
  }

  // 检查自定义权限标识
  if (menu.permission) {
    const config: PermissionConfig = {
      mode: 'permission',
      permissions: menu.permission,
      operator: 'OR'
    }
    if (!checkPermissionAdvanced(config, userInfo)) {
      return false
    }
  }

  return true
}

// 获取扁平化的菜单路径（用于路由权限检查）
export function getMenuPaths(menus: MenuItem[]): string[] {
  const paths: string[] = []

  function traverse(menuItems: MenuItem[]) {
    menuItems.forEach((item) => {
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
  return filteredMenus.map((menu) => ({
    ...menu,
    children: undefined, // 只返回顶层菜单，不包含子菜单
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

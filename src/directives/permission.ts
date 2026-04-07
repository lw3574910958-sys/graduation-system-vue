/**
 * 权限指令 v-permission
 * 用于控制元素的显示与隐藏
 * 支持多种权限检查模式：用户类型、系统角色、权限标识
 */

import { useAuthStore } from '@/stores'
import { SYSTEM_ROLE, USER_TYPE_ENUM } from '@/constants'

export interface PermissionDirectiveElement extends HTMLElement {
  _originalDisplay?: string
}

// 权限检查模式
export type PermissionMode = 'userType' | 'systemRole' | 'permission'

// 菜单项接口定义（导出供 menu.ts 使用）
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

// 权限配置
export interface PermissionConfig {
  mode?: PermissionMode
  permissions: string | string[]
  operator?: 'AND' | 'OR' // 多个权限的逻辑运算符
}

export const permission = {
  mounted(el: PermissionDirectiveElement, binding: { value: string | PermissionConfig }) {
    const { value } = binding
    const authStore = useAuthStore()

    // 解析权限配置
    const config = parsePermissionConfig(value)
    
    // 如果没有权限，则隐藏该元素
    if (!checkPermissionAdvanced(config, authStore.userInfo)) {
      el._originalDisplay = el.style.display
      el.style.display = 'none'
    }
  },
  updated(el: PermissionDirectiveElement, binding: { value: string | PermissionConfig }) {
    const { value } = binding
    const authStore = useAuthStore()

    // 解析权限配置
    const config = parsePermissionConfig(value)
    
    if (!checkPermissionAdvanced(config, authStore.userInfo)) {
      el.style.display = 'none'
    } else {
      el.style.display = el._originalDisplay || ''
    }
  },
}

// 解析权限配置
function parsePermissionConfig(value: string | PermissionConfig): PermissionConfig {
  if (typeof value === 'string') {
    return {
      mode: 'userType',
      permissions: value
    }
  }
  return {
    mode: value.mode || 'userType',
    permissions: value.permissions,
    operator: value.operator || 'OR'
  }
}

// 高级权限检查（导出供 menu.ts 使用）
export function checkPermissionAdvanced(config: PermissionConfig, userInfo: any): boolean {
  if (!userInfo) return false
  
  const permissions = Array.isArray(config.permissions) ? config.permissions : [config.permissions]
  
  switch (config.mode) {
    case 'systemRole':
      return checkSystemRolePermission(permissions, userInfo.systemRoles || [], config.operator)
    case 'permission':
      return checkPermissionIdentifiers(permissions, userInfo.permissions || [], config.operator)
    case 'userType':
    default:
      return checkUserTypePermission(permissions, userInfo.userType, config.operator)
  }
}

// 检查用户类型权限
function checkUserTypePermission(permissions: string[], userType: string, operator: 'AND' | 'OR' = 'OR'): boolean {
  if (!userType) return false
  
  const normalizedUserType = userType.toLowerCase()
  const normalizedPermissions = permissions.map(p => p.toLowerCase())
  
  const checkResults = normalizedPermissions.map(permission => {
    switch (normalizedUserType) {
      case USER_TYPE_ENUM.STUDENT:
        //return permission === 'student'
      case USER_TYPE_ENUM.TEACHER:
        //return permission === 'teacher'
      case USER_TYPE_ENUM.SYSTEM_ADMIN:
      case USER_TYPE_ENUM.DEPARTMENT_ADMIN:
        // 系统管理员和院系管理员只拥有明确配置的权限
        // 不再默认拥有所有用户类型的权限
        return normalizedPermissions.includes(normalizedUserType)
      default:
        return false
    }
  })
  
  return operator === 'AND' 
    ? checkResults.every(result => result)
    : checkResults.some(result => result)
}

// 检查系统角色权限
function checkSystemRolePermission(permissions: string[], systemRoles: string[], operator: 'AND' | 'OR' = 'OR'): boolean {
  if (!systemRoles.length) return false
  
  const normalizedPermissions = permissions.map(p => p.toLowerCase())
  const normalizedRoles = systemRoles.map(r => r.toLowerCase())
  
  // 系统管理员只拥有 system_admin 角色权限
  // 不再默认拥有所有用户类型的权限
  const checkResults = normalizedPermissions.map(permission => {
    switch (permission) {
      case 'admin':
        return normalizedRoles.includes(SYSTEM_ROLE.SYSTEM_ADMIN) || 
               normalizedRoles.includes(SYSTEM_ROLE.DEPARTMENT_ADMIN)
      case 'system_admin':
        return normalizedRoles.includes(SYSTEM_ROLE.SYSTEM_ADMIN)
      case 'department_admin':
        return normalizedRoles.includes(SYSTEM_ROLE.DEPARTMENT_ADMIN)
      case 'teacher':
        return normalizedRoles.includes(SYSTEM_ROLE.TEACHER)
      case 'student':
        return normalizedRoles.includes(SYSTEM_ROLE.STUDENT)
      default:
        return normalizedRoles.includes(permission)
    }
  })
  
  return operator === 'AND' 
    ? checkResults.every(result => result)
    : checkResults.some(result => result)
}

// 检查权限标识
function checkPermissionIdentifiers(permissions: string[], userPermissions: string[], operator: 'AND' | 'OR' = 'OR'): boolean {
  if (!userPermissions.length) return false
  
  const normalizedPermissions = permissions.map(p => p.toLowerCase())
  const normalizedUserPermissions = userPermissions.map(p => p.toLowerCase())
  
  const checkResults = normalizedPermissions.map(permission => 
    normalizedUserPermissions.includes(permission)
  )
  
  return operator === 'AND' 
    ? checkResults.every(result => result)
    : checkResults.some(result => result)
}

// 保持向后兼容的简单权限检查函数
function checkPermission(requiredPermission: string, userType?: string): boolean {
  const config: PermissionConfig = {
    mode: 'userType',
    permissions: requiredPermission
  }
  return checkPermissionAdvanced(config, { userType })
}

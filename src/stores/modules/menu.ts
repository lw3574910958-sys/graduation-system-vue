import { defineStore } from 'pinia'
import { ref } from 'vue'

// 菜单项类型
export interface MenuItem {
  id: number
  parentId: number
  name: string
  path: string
  component?: string
  icon?: string
  sort: number
  visible: boolean
  disabled: boolean
}

export const useMenuStore = defineStore('menu', () => {
  // 菜单列表
  const menus = ref<MenuItem[]>([])
  
  // 当前激活的菜单
  const activeMenu = ref<string>('')
  
  // 展开的菜单
  const expandedMenus = ref<string[]>([])
  
  // 设置菜单列表
  const setMenus = (menuList: MenuItem[]) => {
    menus.value = menuList
  }
  
  // 设置当前激活菜单
  const setActiveMenu = (path: string) => {
    activeMenu.value = path
  }
  
  // 设置展开的菜单
  const setExpandedMenus = (paths: string[]) => {
    expandedMenus.value = paths
  }
  
  // 获取用户有权限的菜单
  const getUserMenus = () => {
    return menus.value.filter(menu => !menu.disabled && menu.visible)
  }
  
  return {
    menus,
    activeMenu,
    expandedMenus,
    setMenus,
    setActiveMenu,
    setExpandedMenus,
    getUserMenus
  }
})
/**
 * 统一应用状态管理
 * 整合应用级别的状态，包括加载状态、主题、语言等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import storageUtil from '@/utils/storage'

// 应用配置常量
const APP_CONFIG_KEYS = {
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed'
} as const

export const useAppStateStore = defineStore('app-state', () => {
  // ========== 基础状态 ==========
  
  // 全局加载状态
  const loading = ref(false)
  const loadingCount = ref(0)
  
  // 主题模式
  const theme = ref<'light' | 'dark'>(
    storageUtil.get(APP_CONFIG_KEYS.THEME) || 'light'
  )
  
  // 语言设置
  const language = ref<string>(
    storageUtil.get(APP_CONFIG_KEYS.LANGUAGE) || 'zh-CN'
  )
  
  // 侧边栏状态
  const sidebarCollapsed = ref(
    storageUtil.get(APP_CONFIG_KEYS.SIDEBAR_COLLAPSED) === 'true'
  )
  
  // 网络状态
  const isOnline = ref(navigator.onLine)
  
  // ========== 计算属性 ==========
  
  // 是否正在加载
  const isLoading = computed(() => loading.value || loadingCount.value > 0)
  
  // 主题CSS类名
  const themeClass = computed(() => `theme-${theme.value}`)
  
  // ========== 方法 ==========
  
  // 设置加载状态（支持嵌套调用）
  const setLoading = (isLoading: boolean, message?: string) => {
    if (isLoading) {
      loadingCount.value++
      loading.value = true
    } else {
      loadingCount.value = Math.max(0, loadingCount.value - 1)
      if (loadingCount.value === 0) {
        loading.value = false
      }
    }
  }
  
  // 显示全局加载
  const showLoading = (message?: string) => {
    setLoading(true, message)
  }
  
  // 隐藏全局加载
  const hideLoading = () => {
    setLoading(false)
  }
  
  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    storageUtil.set(APP_CONFIG_KEYS.THEME, theme.value)
    applyTheme()
  }
  
  // 设置主题
  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    storageUtil.set(APP_CONFIG_KEYS.THEME, newTheme)
    applyTheme()
  }
  
  // 应用主题（实际DOM操作）
  const applyTheme = () => {
    const html = document.documentElement
    html.classList.remove('theme-light', 'theme-dark')
    html.classList.add(themeClass.value)
  }
  
  // 设置语言
  const setLanguage = (lang: string) => {
    language.value = lang
    storageUtil.set(APP_CONFIG_KEYS.LANGUAGE, lang)
    // 可以在这里触发语言切换的其他逻辑
  }
  
  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    storageUtil.set(APP_CONFIG_KEYS.SIDEBAR_COLLAPSED, sidebarCollapsed.value.toString())
  }
  
  // 设置侧边栏状态
  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
    storageUtil.set(APP_CONFIG_KEYS.SIDEBAR_COLLAPSED, collapsed.toString())
  }
  
  // 更新网络状态
  const updateNetworkStatus = (online: boolean) => {
    isOnline.value = online
  }
  
  // 初始化应用状态
  const initialize = () => {
    // 应用存储的主题
    applyTheme()
    
    // 监听网络状态变化
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => updateNetworkStatus(true))
      window.addEventListener('offline', () => updateNetworkStatus(false))
    }
  }
  
  // 重置所有状态
  const reset = () => {
    loading.value = false
    loadingCount.value = 0
    theme.value = 'light'
    language.value = 'zh-CN'
    sidebarCollapsed.value = false
    isOnline.value = navigator.onLine
    
    // 清除存储
    Object.values(APP_CONFIG_KEYS).forEach(key => {
      storageUtil.remove(key)
    })
  }
  
  return {
    // 状态
    loading,
    loadingCount,
    theme,
    language,
    sidebarCollapsed,
    isOnline,
    
    // 计算属性
    isLoading,
    themeClass,
    
    // 方法
    setLoading,
    showLoading,
    hideLoading,
    toggleTheme,
    setTheme,
    setLanguage,
    toggleSidebar,
    setSidebarCollapsed,
    updateNetworkStatus,
    initialize,
    reset
  }
})
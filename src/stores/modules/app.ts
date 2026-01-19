import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 加载状态
  const loading = ref(false)
  
  // 主题模式
  const theme = ref<'light' | 'dark'>('light')
  
  // 语言设置
  const language = ref<string>('zh-CN')
  
  // 侧边栏状态
  const sidebarCollapsed = ref(false)
  
  // 设置加载状态
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }
  
  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  
  // 设置主题
  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
  }
  
  // 设置语言
  const setLanguage = (lang: string) => {
    language.value = lang
  }
  
  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  // 设置侧边栏状态
  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
  }
  
  return {
    loading,
    theme,
    language,
    sidebarCollapsed,
    setLoading,
    toggleTheme,
    setTheme,
    setLanguage,
    toggleSidebar,
    setSidebarCollapsed
  }
})
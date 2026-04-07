import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 导出所有 store 模块
export { useAuthStore } from './modules/auth'
export { useMenuStore } from './modules/menu'
export { useAppStateStore } from './modules/appState'
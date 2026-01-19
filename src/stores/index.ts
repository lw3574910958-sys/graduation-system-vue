import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 导出所有store模块
export { useAuthStore } from './modules/auth'
export { useUserStore } from './modules/user'
export { useMenuStore } from './modules/menu'
export { useAppStore } from './modules/app'
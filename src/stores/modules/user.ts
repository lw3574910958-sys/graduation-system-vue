// 注意：此文件已被废弃，请使用 auth.ts 中的 useAuthStore
// 用户相关信息现在统一在 auth store 中管理

import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // 为了向后兼容，提供空的store
  return {
    // 废弃的方法，建议迁移到 useAuthStore
  }
})
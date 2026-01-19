import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserResponse } from '@/types/api/user'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref<UserResponse | null>(null)
  
  // 设置用户信息
  const setUserInfo = (info: UserResponse | null) => {
    userInfo.value = info
  }
  
  // 清除用户信息
  const clearUserInfo = () => {
    userInfo.value = null
  }
  
  return {
    userInfo,
    setUserInfo,
    clearUserInfo
  }
})
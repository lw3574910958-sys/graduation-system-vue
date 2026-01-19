import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api/user'
import type { UserResponse } from '@/types/api/user'
import type { ApiResponse } from '@/types/global'
import storageUtil from '@/utils/storage'
import constants from '@/utils/constants'

export const useAuthStore = defineStore('auth', () => {
  // 使用浏览器存储来持久化token
  const token = ref(storageUtil.get(constants.TOKEN_NAME) || '')
  const userInfo = ref<UserResponse | null>(null)
  const isAuthenticated = ref(false)

  // 设置token
  const setToken = (newToken: string) => {
    token.value = newToken
    storageUtil.set(constants.TOKEN_NAME, newToken)
    isAuthenticated.value = !!newToken
  }

  // 清除认证信息
  const clearAuth = () => {
    token.value = ''
    storageUtil.remove(constants.TOKEN_NAME)
    userInfo.value = null
    isAuthenticated.value = false
  }

  // 获取当前用户信息
  const fetchUserInfo = async () => {
    if (!token.value) {
      throw new Error('未登录')
    }

    try {
      const response = await userApi.getCurrentUserInfo()
      if (response?.code === 200 && response?.data) {
        userInfo.value = response.data
        isAuthenticated.value = true
        return response.data
      } else {
        throw new Error(response?.message || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      clearAuth() // 获取失败时清除认证信息
      throw error
    }
  }

  // 检查是否已认证
  const checkAuth = () => {
    return !!token.value
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    setToken,
    clearAuth,
    fetchUserInfo,
    checkAuth
  }
})
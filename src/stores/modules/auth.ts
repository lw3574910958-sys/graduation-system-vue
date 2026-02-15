/**
 * 登录状态管理
 */

import { defineStore } from 'pinia'
import { ref, onScopeDispose } from 'vue'
import { userApi } from '@/api/user'
import type { LoginUserInfoResponse } from '@/types/api/user'
import type { ApiResponse } from '@/types/global'
import storageUtil from '@/utils/storage'
import constants from '@/utils/constants'
import { fetchUserInfoWithTimeout } from '@/utils/user-utils'

export const useAuthStore = defineStore('auth', () => {
  // token
  const token = ref(storageUtil.get(constants.TOKEN_NAME) || '')
  // 用户信息
  const userInfo = ref<LoginUserInfoResponse | null>(null)
  // 登录状态
  const isAuthenticated = ref(!!token.value)

  // 👇 监听 localStorage 变化（跨标签页同步）
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === constants.TOKEN_NAME) {
      // e.newValue 是字符串或 null
      const newToken = e.newValue || ''
      token.value = newToken
      isAuthenticated.value = !!newToken
      if (!newToken) {
        userInfo.value = null
      }
    }
  }

  // 添加监听器
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange)
  }

  // 组件/作用域销毁时移除监听器（避免内存泄漏）
  onScopeDispose(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange)
    }
  })

  // 设置 token
  const setToken = (newToken: string) => {
    token.value = newToken
    storageUtil.set(constants.TOKEN_NAME, newToken)
    isAuthenticated.value = true
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
      const userData = await fetchUserInfoWithTimeout(constants.USER_INFO_FETCH_TIMEOUT)
      userInfo.value = userData
      isAuthenticated.value = true
      return userData
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      if (error.message === 'UNAUTHORIZED' || error.response?.data?.code === 401) {
        clearAuth()
        throw new Error('UNAUTHORIZED')
      }
      clearAuth()
      throw error
    }
  }

  // 检查是否已认证（基于当前 store 状态）
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
    checkAuth,
  }
})

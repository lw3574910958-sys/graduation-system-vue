/*
 * 认证相关的组合式函数
 */

import { ref } from 'vue'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores'
import type { ApiResponse } from '@/types/global'

// 认证相关的组合式函数
export const useAuth = () => {
  const loading = ref(false)
  const captchaImage = ref('')
  const captchaKey = ref('')

  // 获取验证码
  const getCaptcha = async () => {
    try {
      const response = await authApi.getCaptcha()
      // 后端返回的结构是 { code, message, data }，data 中才是真正的验证码数据
      captchaImage.value = response.data.captchaImg
      captchaKey.value = response.data.captchaId
      return response
    } catch (error) {
      console.error('获取验证码失败:', error)
      throw error
    }
  }

  // 用户登录
  const login = async (username: string, password: string, captchaCode: string) => {
    if (!captchaKey.value) {
      throw new Error('请先获取验证码')
    }

    loading.value = true
    try {
      // 执行登录（后端会验证验证码）
      const response = await authApi.login({
        username,
        password,
        captchaCode,
        captchaKey: captchaKey.value,
      })

      const authStore = useAuthStore()
      authStore.setToken(response.data.token)

      // 获取用户信息
      await authStore.fetchUserInfo()

      return response
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 用户登出
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('登出失败:', error)
      // 即使登出API失败，也要清理本地状态
    } finally {
      const authStore = useAuthStore()
      authStore.clearAuth()
    }
  }

  // 检查登录状态
  const checkAuth = () => {
    const authStore = useAuthStore()
    return authStore.checkAuth()
  }

  return {
    loading,
    captchaImage,
    captchaKey,
    getCaptcha,
    login,
    logout,
    checkAuth,
  }
}

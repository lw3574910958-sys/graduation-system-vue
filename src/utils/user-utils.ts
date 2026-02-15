/**
 * 用户工具类
 */
import { authApi } from '@/api/auth'
import constants from './constants'

/**
 * 带超时保护的获取用户信息方法
 * @param timeout 超时时间，默认8秒
 * @returns Promise<UserResponse>
 */
export const fetchUserInfoWithTimeout = async (timeout: number = 8000) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await authApi.getCurrentUser()
    clearTimeout(timeoutId)
    return response.data
  } catch (error) {
    clearTimeout(timeoutId)

    // 检查 error 是否具有 name 属性且为 AbortError
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('获取用户信息超时')
      throw new Error('获取用户信息超时')
    }

    // 明确抛出网络错误
    console.error('获取用户信息失败:', error)
    throw error // ← 确保 reject
  }
}

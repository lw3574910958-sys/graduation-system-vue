/**
 * Token管理工具
 * 提供token的存储、验证、刷新和过期处理等功能
 */

import storageUtil from '@/utils/storage'
import constants from '@/utils/constants'

// Token信息接口
export interface TokenInfo {
  token: string
  refreshToken?: string
  expiresAt?: number // 过期时间戳
  issuedAt?: number  // 签发时间戳
}

class SimpleTokenManager {
  private readonly STORAGE_KEY = constants.TOKEN_NAME
  private readonly REFRESH_KEY = 'refresh_token'
  private readonly EXPIRES_KEY = `${constants.TOKEN_NAME}_expires`
  private readonly ISSUED_KEY = `${constants.TOKEN_NAME}_issued`

  /**
   * 设置token
   */
  setToken(tokenInfo: TokenInfo): void {
    try {
      // 存储访问token
      storageUtil.set(this.STORAGE_KEY, tokenInfo.token)
      
      // 存储刷新token（如果有）
      if (tokenInfo.refreshToken) {
        storageUtil.set(this.REFRESH_KEY, tokenInfo.refreshToken)
      }
      
      // 存储过期时间信息
      if (tokenInfo.expiresAt) {
        storageUtil.set(this.EXPIRES_KEY, tokenInfo.expiresAt.toString())
      }
      
      if (tokenInfo.issuedAt) {
        storageUtil.set(this.ISSUED_KEY, tokenInfo.issuedAt.toString())
      }
      
    } catch (error) {
      console.error('设置token失败:', error)
    }
  }

  /**
   * 获取token
   */
  getToken(): string | null {
    return storageUtil.get(this.STORAGE_KEY)
  }

  /**
   * 获取刷新token
   */
  getRefreshToken(): string | null {
    return storageUtil.get(this.REFRESH_KEY)
  }

  /**
   * 获取token过期时间
   */
  getTokenExpiresAt(): number | null {
    const expiresStr = storageUtil.get(this.EXPIRES_KEY)
    return expiresStr ? parseInt(expiresStr, 10) : null
  }

  /**
   * 检查token是否即将过期（30分钟内）
   */
  isTokenExpiringSoon(): boolean {
    const expiresAt = this.getTokenExpiresAt()
    if (!expiresAt) return false
    
    const now = Date.now()
    const threshold = 30 * 60 * 1000 // 30分钟
    return expiresAt - now < threshold
  }

  /**
   * 检查token是否已过期
   */
  isTokenExpired(): boolean {
    const expiresAt = this.getTokenExpiresAt()
    if (!expiresAt) return false
    
    return Date.now() >= expiresAt
  }

  /**
   * 清除所有token相关数据
   */
  clearTokens(): void {
    storageUtil.remove(this.STORAGE_KEY)
    storageUtil.remove(this.REFRESH_KEY)
    storageUtil.remove(this.EXPIRES_KEY)
    storageUtil.remove(this.ISSUED_KEY)
  }

  /**
   * 模拟刷新token（实际项目中需要调用真实API）
   */
  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('无刷新token')
    }

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 生成新的token（模拟）
      const newToken = `${refreshToken}_refreshed_${Date.now()}`
      const newRefreshToken = `${refreshToken}_new_${Date.now()}`
      
      // 设置2小时后过期
      const expiresAt = Date.now() + 2 * 60 * 60 * 1000
      
      this.setToken({
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt,
        issuedAt: Date.now()
      })
      
      return newToken
    } catch (error) {
      console.error('刷新token失败:', error)
      this.clearTokens()
      throw error
    }
  }

  /**
   * 检查并刷新即将过期的token
   */
  async checkAndRefreshToken(): Promise<boolean> {
    if (this.isTokenExpiringSoon() && !this.isTokenExpired()) {
      try {
        await this.refreshToken()
        return true
      } catch (error) {
        console.error('检查并刷新token失败:', error)
        return false
      }
    }
    return false
  }
}

// 创建实例
export const tokenManager = new SimpleTokenManager()

// 导出便捷方法
export const setToken = (tokenInfo: TokenInfo) => tokenManager.setToken(tokenInfo)
export const getToken = () => tokenManager.getToken()
export const clearTokens = () => tokenManager.clearTokens()
export const refreshToken = () => tokenManager.refreshToken()
export const isTokenExpiringSoon = () => tokenManager.isTokenExpiringSoon()
export const isTokenExpired = () => tokenManager.isTokenExpired()
export const checkAndRefreshToken = () => tokenManager.checkAndRefreshToken()

export default tokenManager
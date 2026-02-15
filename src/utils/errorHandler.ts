/**
 * 统一错误处理工具
 */

import { ElMessage, ElNotification } from 'element-plus'
import { MESSAGE } from '@/constants/user'
import { useAuthStore } from '@/stores'
import storageUtil from '@/utils/storage'
import constants from '@/utils/constants'

// 错误类型枚举
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  AUTH = 'AUTHENTICATION_ERROR',
  PERMISSION = 'PERMISSION_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  BUSINESS = 'BUSINESS_ERROR',
  USERNAME_EXISTS = 'USERNAME_EXISTS_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

// 错误详情接口
export interface ErrorDetail {
  type: ErrorType
  message: string
  code?: number
  originalError?: any
  timestamp: number
}

// 业务错误类
export class BusinessError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'BusinessError'
  }
}

// 网络错误类
export class NetworkError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message)
    this.name = 'NetworkError'
  }
}

// 认证错误类
export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class ErrorHandler {
  // 处理 API 响应错误
  static handleApiResponseError(error: any): ErrorDetail {
    const timestamp = Date.now()
    
    // 处理业务错误（后端返回的标准格式）
    if (error?.response?.data) {
      const responseData = error.response.data
      const code = responseData.code
      const message = responseData.message || MESSAGE.OPERATION_FAILED
      
      // 认证相关错误
      if (code === 401) {
        return this.handleAuthError(message, timestamp)
      }
      
      // 权限相关错误
      if (code === 403) {
        return this.handlePermissionError(message, timestamp)
      }
      
      // 验证相关错误
      if (code >= 400 && code < 500 && code !== 401 && code !== 403) {
        return {
          type: ErrorType.VALIDATION,
          message,
          code,
          originalError: error,
          timestamp
        }
      }
      
      // 业务逻辑错误
      if (code === 1001) { // USERNAME_EXISTS
        return {
          type: ErrorType.USERNAME_EXISTS,
          message,
          code,
          originalError: error,
          timestamp
        }
      }
      
      return {
        type: ErrorType.BUSINESS,
        message,
        code,
        originalError: error,
        timestamp
      }
    }
    
    // 处理网络错误
    if (error?.message?.includes('timeout') || error?.message?.includes('Network Error')) {
      return {
        type: ErrorType.NETWORK,
        message: MESSAGE.NETWORK_ERROR,
        originalError: error,
        timestamp
      }
    }
    
    // 处理 HTTP 状态码错误
    if (error?.response?.status) {
      const status = error.response.status
      let message: string = MESSAGE.OPERATION_FAILED
            
      switch (status) {
        case 401:
          return this.handleAuthError(MESSAGE.LOGIN_EXPIRED, timestamp)
        case 403:
          return this.handlePermissionError('权限不足', timestamp)
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 502:
        case 503:
        case 504:
          message = '服务暂时不可用'
          break
      }
      
      return {
        type: ErrorType.BUSINESS,
        message,
        code: status,
        originalError: error,
        timestamp
      }
    }
    
    // 未知错误
    return {
      type: ErrorType.UNKNOWN,
      message: error?.message || MESSAGE.OPERATION_FAILED,
      originalError: error,
      timestamp
    }
  }
  
  // 处理认证错误
  private static handleAuthError(message: string, timestamp: number): ErrorDetail {
    // 清除认证信息
    const authStore = useAuthStore()
    authStore.clearAuth()
    
    // 显示错误提示
    ElMessage.error(message)
    
    // 跳转到登录页
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    }
    
    return {
      type: ErrorType.AUTH,
      message,
      timestamp
    }
  }
  
  // 处理权限错误
  private static handlePermissionError(message: string, timestamp: number): ErrorDetail {
    ElMessage.error(message)
    return {
      type: ErrorType.PERMISSION,
      message,
      timestamp
    }
  }
  
  // 显示错误通知
  static showErrorNotification(errorDetail: ErrorDetail): void {
    const titleMap = {
      [ErrorType.NETWORK]: '网络错误',
      [ErrorType.AUTH]: '认证失败',
      [ErrorType.PERMISSION]: '权限不足',
      [ErrorType.VALIDATION]: '数据验证失败',
      [ErrorType.BUSINESS]: '业务错误',
      [ErrorType.USERNAME_EXISTS]: '用户名重复',
      [ErrorType.UNKNOWN]: '未知错误'
    }
    
    ElNotification({
      title: titleMap[errorDetail.type] || '错误',
      message: errorDetail.message,
      type: 'error',
      duration: 5000,
      dangerouslyUseHTMLString: false
    })
  }
  
  // 记录错误日志
  static logError(errorDetail: ErrorDetail): void {
    if (import.meta.env.DEV) {
      console.group('🚨 错误详情')
      console.log('类型:', errorDetail.type)
      console.log('消息:', errorDetail.message)
      console.log('时间:', new Date(errorDetail.timestamp).toISOString())
      if (errorDetail.code) {
        console.log('错误码:', errorDetail.code)
      }
      if (errorDetail.originalError) {
        console.log('原始错误:', errorDetail.originalError)
      }
      console.groupEnd()
    }
    
    // 生产环境可以发送到错误监控服务
    // 例如 Sentry、LogRocket 等
  }
  
  // 全局错误处理
  static handleGlobalError(error: any): void {
    const errorDetail = this.handleApiResponseError(error)
    this.logError(errorDetail)
    
    // 根据错误类型决定是否显示通知
    if (errorDetail.type !== ErrorType.AUTH) {
      this.showErrorNotification(errorDetail)
    }
    
    // 抛出自定义错误供上层处理
    if (errorDetail.type === ErrorType.BUSINESS) {
      throw new BusinessError(
        errorDetail.code || 0,
        errorDetail.message,
        errorDetail.originalError
      )
    }
  }
}

// Vue 全局错误处理
export function setupGlobalErrorHandler() {
  // Vue 组件错误处理
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      ErrorHandler.logError({
        type: ErrorType.UNKNOWN,
        message: event.error?.message || 'JavaScript 运行时错误',
        originalError: event.error,
        timestamp: Date.now()
      })
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      ErrorHandler.handleGlobalError(event.reason)
      event.preventDefault() // 防止控制台显示默认的未处理 Promise 错误
    })
  }
}

export default ErrorHandler
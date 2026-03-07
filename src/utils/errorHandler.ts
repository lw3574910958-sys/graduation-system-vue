/**
 * 全局错误处理器
 * 统一处理应用中的各种错误类型
 */

import { ElMessage, ElNotification } from 'element-plus'
import type { AxiosError } from 'axios'
import router from '@/router'
import { clearTokens } from '@/utils/tokenManager'

// 错误类型枚举
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',      // 网络错误
  AUTH_ERROR = 'AUTH_ERROR',            // 认证错误
  PERMISSION_ERROR = 'PERMISSION_ERROR', // 权限错误
  VALIDATION_ERROR = 'VALIDATION_ERROR', // 验证错误
  SERVER_ERROR = 'SERVER_ERROR',        // 服务器错误
  BUSINESS_ERROR = 'BUSINESS_ERROR',    // 业务逻辑错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'       // 未知错误
}

// 错误信息接口
export interface AppError {
  type: ErrorType
  message: string
  code?: number | string
  originalError?: any
  timestamp: number
}

// 错误处理配置
interface ErrorHandlerConfig {
  showNotification?: boolean
  showMessage?: boolean
  redirectToLogin?: boolean
  logToConsole?: boolean
}

// 默认配置
const DEFAULT_CONFIG: Required<ErrorHandlerConfig> = {
  showNotification: true,
  showMessage: true,
  redirectToLogin: true,
  logToConsole: true
}

class GlobalErrorHandler {
  private config: Required<ErrorHandlerConfig>

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * 处理HTTP错误
   */
  handleHttpError(error: AxiosError): AppError {
    const status = error.response?.status
    const data = error.response?.data as any
    
    let errorType: ErrorType
    let message: string
    let code: number | string | undefined

    // 根据状态码判断错误类型
    switch (status) {
      case 400:
        errorType = ErrorType.VALIDATION_ERROR
        message = data?.message || '请求参数错误'
        code = data?.code
        break
        
      case 401:
        errorType = ErrorType.AUTH_ERROR
        message = data?.message || '未授权访问'
        code = data?.code
        // 自动跳转到登录页
        if (this.config.redirectToLogin) {
          this.handleAuthError()
        }
        break
        
      case 403:
        errorType = ErrorType.PERMISSION_ERROR
        message = data?.message || '权限不足'
        code = data?.code
        break
        
      case 404:
        errorType = ErrorType.SERVER_ERROR
        message = data?.message || '请求的资源不存在'
        code = data?.code
        break
        
      case 500:
        errorType = ErrorType.SERVER_ERROR
        message = data?.message || '服务器内部错误'
        code = data?.code
        break
        
      default:
        if (error.code === 'NETWORK_ERROR' || !status) {
          errorType = ErrorType.NETWORK_ERROR
          message = '网络连接失败，请检查网络设置'
        } else {
          errorType = ErrorType.UNKNOWN_ERROR
          message = data?.message || '未知错误'
          code = data?.code || status
        }
    }

    const appError: AppError = {
      type: errorType,
      message,
      code,
      originalError: error,
      timestamp: Date.now()
    }

    this.handleError(appError)
    return appError
  }

  /**
   * 处理业务错误
   */
  handleBusinessError(message: string, code?: number | string): AppError {
    const appError: AppError = {
      type: ErrorType.BUSINESS_ERROR,
      message,
      code,
      timestamp: Date.now()
    }

    this.handleError(appError)
    return appError
  }

  /**
   * 处理通用错误
   */
  handleError(error: AppError): void {
    // 记录到控制台
    if (this.config.logToConsole) {
      console.error('[Global Error Handler]', error)
    }

    // 显示消息
    if (this.config.showMessage) {
      this.showErrorMessage(error)
    }

    // 显示通知
    if (this.config.showNotification) {
      this.showNotification(error)
    }

    // 特殊处理某些错误类型
    this.handleSpecialErrors(error)
  }

  /**
   * 显示错误消息
   */
  private showErrorMessage(error: AppError): void {
    const message = this.formatErrorMessage(error)
    
    switch (error.type) {
      case ErrorType.AUTH_ERROR:
      case ErrorType.PERMISSION_ERROR:
        ElMessage.error({
          message,
          duration: 3000,
          showClose: true
        })
        break
        
      case ErrorType.VALIDATION_ERROR:
        ElMessage.warning({
          message,
          duration: 5000,
          showClose: true
        })
        break
        
      case ErrorType.NETWORK_ERROR:
        ElMessage.error({
          message,
          duration: 0, // 不自动关闭
          showClose: true
        })
        break
        
      default:
        ElMessage.error({
          message,
          duration: 3000,
          showClose: true
        })
    }
  }

  /**
   * 显示通知
   */
  private showNotification(error: AppError): void {
    // 对于严重错误显示通知
    if ([ErrorType.AUTH_ERROR, ErrorType.SERVER_ERROR, ErrorType.NETWORK_ERROR].includes(error.type)) {
      ElNotification({
        title: this.getErrorTitle(error),
        message: this.formatErrorMessage(error),
        type: 'error',
        duration: 0,
        dangerouslyUseHTMLString: true
      })
    }
  }

  /**
   * 处理认证错误
   */
  private handleAuthError(): void {
    // 清除认证信息
    clearTokens()
    
    // 跳转到登录页
    const currentRoute = router.currentRoute.value
    if (currentRoute.name !== 'login') {
      router.push({
        name: 'login',
        query: {
          redirect: currentRoute.fullPath
        }
      }).catch(() => {
        // 忽略导航错误
      })
    }
  }

  /**
   * 处理特殊错误类型
   */
  private handleSpecialErrors(error: AppError): void {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        // 可以在这里添加网络错误的特殊处理
        break
        
      case ErrorType.SERVER_ERROR:
        // 可以在这里添加服务器错误的特殊处理
        break
    }
  }

  /**
   * 格式化错误消息
   */
  private formatErrorMessage(error: AppError): string {
    let message = error.message
    
    // 添加错误码信息
    if (error.code) {
      message = `[${error.code}] ${message}`
    }
    
    return message
  }

  /**
   * 获取错误标题
   */
  private getErrorTitle(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return '网络错误'
      case ErrorType.AUTH_ERROR:
        return '认证失败'
      case ErrorType.PERMISSION_ERROR:
        return '权限不足'
      case ErrorType.VALIDATION_ERROR:
        return '参数错误'
      case ErrorType.SERVER_ERROR:
        return '服务器错误'
      case ErrorType.BUSINESS_ERROR:
        return '业务错误'
      default:
        return '未知错误'
    }
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 重置配置为默认值
   */
  resetConfig(): void {
    this.config = { ...DEFAULT_CONFIG }
  }
}

// 创建全局错误处理器实例
export const errorHandler = new GlobalErrorHandler()

// 导出便捷方法
export const handleHttpError = (error: AxiosError) => errorHandler.handleHttpError(error)
export const handleBusinessError = (message: string, code?: number | string) => 
  errorHandler.handleBusinessError(message, code)
export const handleError = (error: AppError) => errorHandler.handleError(error)

// 全局错误处理设置函数
export const setupGlobalErrorHandler = () => {
  // 设置全局Vue错误处理
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error)
      // 可以在这里添加更多的全局错误处理逻辑
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      // 可以在这里添加更多的未处理Promise拒绝处理逻辑
    })
  }
}

export default errorHandler
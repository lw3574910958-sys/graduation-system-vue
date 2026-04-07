/**
 * @description: axios 封装
 */

import axios, {
  type AxiosError,
  type AxiosResponse,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import storageUtil from '@/utils/storage'
import constants from '@/utils/constants'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores'
import { MESSAGE } from '@/constants/user'
import { handleHttpError } from '@/utils/errorHandler'

let isAlreadyLoggingOut = false

// 自定义 JSON 解析器，解决大数字精度丢失问题
const customParse = (text: string): any => {
  // 如果不是字符串（例如 Blob），直接返回原值
  if (typeof text !== 'string') {
    return text
  }
  
  // 在 JSON 解析前，使用正则表达式将所有大数字（雪花算法 ID）添加引号转为字符串
  // 匹配模式："key":1234567890123456789  -> "key":"1234567890123456789"
  const normalizedText = text.replace(/(:\s*)(\d{16,})/g, (match, prefix, numberStr) => {
    // 如果数字超过 16 位（雪花算法 ID 通常 18-19 位），转为字符串
    const num = Number(numberStr)
    if (num > 9007199253740991) {
      return `${prefix}"${numberStr}"`
    }
    return match
  })
  
  return JSON.parse(normalizedText)
}

// 创建基础 axios 实例（无拦截器，用于 refreshToken）
const baseService = axios.create({
  baseURL: constants.BASE_URL,
  timeout: constants.REQUEST_TIMEOUT,
  withCredentials: false,
  transformResponse: [(text) => customParse(text)], // 使用自定义 JSON 解析
})

// 主 axios 实例（带拦截器）
const service = axios.create({
  baseURL: constants.BASE_URL,
  timeout: constants.REQUEST_TIMEOUT,
  withCredentials: false,
  transformResponse: [(text) => customParse(text)], // 使用自定义 JSON 解析
})

//退出登录
export const logout = () => {
  if (isAlreadyLoggingOut) {
    return
  }

  ElMessageBox.confirm(MESSAGE.CONFIRM_LOGOUT || '确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    closeOnClickModal: false,
    closeOnPressEscape: false,
  })
    .then(() => {
      isAlreadyLoggingOut = true
      storageUtil.clear()
      ElMessage.closeAll()

      if (!window.location.pathname.includes(constants.LOGIN_PATH)) {
        window.location.href = constants.LOGIN_PATH
      }

      setTimeout(() => {
        isAlreadyLoggingOut = false
      }, 1000)
    })
    .catch(() => {
      isAlreadyLoggingOut = false
    })
}

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storageUtil.get(constants.TOKEN_NAME)
    if (token && token.trim()) {
      const cleanToken = token.replace(/^Bearer\s*/i, '').trim()
      config.headers[constants.TOKEN_NAME] = `${constants.TOKEN_PREFIX}${cleanToken}`
    } else {
      delete config.headers[constants.TOKEN_NAME]
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  async (response: AxiosResponse) => {
    // 检查 HTTP 状态码（Blob 响应也需要检查）
    if (response.status >= 400) {
      // Blob 响应中的错误信息处理
      if (response.data instanceof Blob) {
        try {
          // 尝试解析 Blob 中的 JSON 错误信息
          const text = await response.data.text()
          const errorData = JSON.parse(text)
          const error = new Error(errorData.message || '请求失败')
          ;(error as any).response = { data: errorData, status: response.status }
          handleHttpError(error as any)
          return Promise.reject(error)
        } catch (parseError) {
          // 如果解析失败，使用默认错误信息
          const error = new Error(`请求失败 (HTTP ${response.status})`)
          ;(error as any).response = { status: response.status }
          handleHttpError(error as any)
          return Promise.reject(error)
        }
      }
      
      // 非 Blob 的错误响应（正常处理）
      const res = response.data
      const error = new Error(res.message || '请求失败，请稍后重试！')
      ;(error as any).response = { data: res, status: res.code || response.status }
      handleHttpError(error as any)
      return Promise.reject(error)
    }
    
    // Blob 数据处理（返回 Blob 对象本身，而不是整个 response）
    if (response.data instanceof Blob) {
      return response.data
    }

    // 非 JSON 数据处理
    const contentType = (
      response.headers['content-type'] ||
      response.headers['Content-Type'] ||
      ''
    ).toLowerCase()
    if (!contentType.includes('application/json')) {
      return response
    }

    // 后端统一响应结构：{ code: number, message: string, data: T }
    const res = response.data
    // 注意：大数字已经在 transformResponse 中转为字符串了

    //成功
    if (res.code === 200) {
      return res
    }

    // 使用统一错误处理
    const error = new Error(res.message || '请求失败，请稍后重试！')
    ;(error as any).response = { data: res, status: res.code }
    handleHttpError(error as any)
    return Promise.reject(error)
  },
  (error: AxiosError) => {
    // 使用统一错误处理
    handleHttpError(error)
    return Promise.reject(error)
  },
)

// ==================== Token 自动刷新 ====================
let refreshTimeoutId: number | null = null

const refreshToken = async (): Promise<void> => {
  try {
    const oldToken = storageUtil.get(constants.TOKEN_NAME)
    if (!oldToken) {
      logout()
      return
    }
    const cleanToken = oldToken.replace(/^Bearer\s*/i, '').trim()
    const res = await baseService.post('/api/auth/refresh-token', null, {
      headers: { [constants.TOKEN_NAME]: constants.TOKEN_PREFIX + cleanToken },
    })

    if (res.data?.code === 200 && res.data?.data?.token) {
      const newToken = constants.TOKEN_PREFIX + res.data.data.token
      storageUtil.set(constants.TOKEN_NAME, newToken)

      scheduleNextRefresh(86400 - 1800)
    } else {
      throw new Error('Refresh token invalid')
    }
  } catch (error) {
    console.error('Token refresh failed:', error)
    logout()
  }
}

const scheduleNextRefresh = (delaySeconds: number) => {
  stopTokenAutoRefresh()
  refreshTimeoutId = window.setTimeout(() => {
    refreshToken()
  }, delaySeconds * 1000)
}

export const startTokenAutoRefresh = () => {
  // 保守策略：每 23.5 小时刷新一次（避免因活跃度不足被踢）
  scheduleNextRefresh(86400 - 1800)
}

export const stopTokenAutoRefresh = () => {
  if (refreshTimeoutId) {
    clearTimeout(refreshTimeoutId)
    refreshTimeoutId = null
  }
}

// ==================== 初始化保活 ====================

export const initAutoRefresh = () => {
  if (typeof window === 'undefined') {
    return
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === constants.TOKEN_NAME && event.newValue === null) {
      logout()
    }
  }

  const handleVisibilityChange = () => {
    if (!document.hidden && storageUtil.get(constants.TOKEN_NAME)) {
      startTokenAutoRefresh()
    }
  }

  const cleanup = () => {
    stopTokenAutoRefresh()
    window.removeEventListener('storage', handleStorageChange)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  window.addEventListener('storage', handleStorageChange)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('beforeunload', cleanup)
  window.addEventListener('pagehide', cleanup)

  if (storageUtil.get(constants.TOKEN_NAME)) {
    startTokenAutoRefresh()
  }
}

if (typeof window !== 'undefined') {
  initAutoRefresh()
}

// ====== 导出通用请求方法 ======
/**
 * 通用请求方法
 * @param config Axios 请求配置
 * @returns Promise<T>
 */
export const http = <T = any>(config: AxiosRequestConfig<any>): Promise<T> => {
  return service.request(config)
}

/**
 * 带超时的请求方法
 * @param config Axios 请求配置
 * @param timeout 超时时间，默认 10 秒
 * @returns Promise<T>
 */
export const httpWithTimeout = <T = any>(
  config: AxiosRequestConfig<any>,
  timeout: number = 10000,
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`请求超时: ${config.url}`)), timeout)
  })

  return Promise.race([
    service.request<T>(config).then((response) => response.data),
    timeoutPromise,
  ])
}

/**
 * 通用 GET 请求方法
 * @param url 请求地址
 * @param params 可选查询参数
 * @param config 可选配置（如 responseType）
 * @returns Promise<any>
 */
export const get = <T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
  return http<T>({
    url: url,
    method: 'get',
    params: params,
    ...config,
  })
}

/**
 * 通用 POST 请求方法
 * @param url 请求地址
 * @param data 请求体数据
 * @returns Promise<any>
 */
export const post = <T = any>(url: string, data?: any): Promise<T> => {
  return http<T>({
    url: url,
    method: 'post',
    data: data,
  })
}

/**
 * 通用 PUT 请求方法（用于全量更新）
 * @param url 请求地址
 * @param data 请求体数据
 * @returns Promise<any>
 */
export const put = <T = any>(url: string, data?: any): Promise<T> => {
  return http<T>({
    url,
    method: 'put',
    data,
  })
}

/**
 * 通用 PATCH 请求方法（用于部分更新）
 * @param url 请求地址
 * @param data 请求体数据
 * @returns Promise<any>
 */
export const patch = <T = any>(url: string, data?: any): Promise<T> => {
  return http<T>({
    url,
    method: 'patch',
    data,
  })
}

/**
 * 通用 DELETE 请求方法
 * @param url 请求地址
 * @param params 可选查询参数（某些 DELETE 接口可能需要 query 参数）
 * @returns Promise<any>
 */
export const del = <T = any>(url: string, params?: any): Promise<T> => {
  return http<T>({
    url,
    method: 'delete',
    params,
  })
}

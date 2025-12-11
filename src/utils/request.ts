import axios, { type AxiosProxyConfig, type AxiosRequestConfig } from 'axios'
import { saveLocalStorage, getLocalStorage, clearLocalStorage } from '@/utils/utils'
import constants from '@/utils/constants'
import { ElMessageBox, ElMessage } from 'element-plus'

//token名称，需要和服务端保持一致
const TOKEN_NAME = constants.USER_TOKEN

//创建axios实例
const service = axios.create({
  baseURL: constants.BASE_URL,
})

///退出系统
export const logout = () => {
  clearLocalStorage()
  window.location.href = constants.PAGE_ADMIN_LOGIN
}

//请求拦截器
service.interceptors.request.use(
  (config) => {
    //在请求头中加入token
    const token = getLocalStorage(constants.USER_TOKEN)
    if (token) {
      config.headers[TOKEN_NAME] = token
    } else {
      delete config.headers[TOKEN_NAME]
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  },
)

//响应拦截器
service.interceptors.response.use(
  (response) => {
    //更具content-type,判断是否是JSON数据
    let contentType = response.headers['content-type']
      ? response.headers['content-type']
      : response.headers['Content-Type']
    if (contentType.indexOf('application/json') === -1) {
      return Promise.resolve(response)
    }

    //Blob数据，直接返回
    if (response.data && response.data instanceof Blob) {
      return Promise.reject(response.data)
    }

    const res = response.data

    if (res.code && res.code !== 200) {
      //token失效，重新登录
      if (res.code === 11012 || res.code === 11011) {
        ElMessage.closeAll()
        ElMessage.error('登录状态已过期，请重新登录！')
        setTimeout(() => {
          logout()
        }, 3000)
        return Promise.reject(response)
      }

      //长时间未操作，token过期
      if (res.code === 30001) {
        ElMessageBox.confirm('你需要重新登录系统', '确认重新登陆', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          logout()
        })
        setTimeout(() => {
          logout()
        }, 3000)
        return Promise.reject(response)
      }

      ElMessage.closeAll()
      if (res.message) {
        ElMessage.error(res.message)
      }
      return Promise.reject(response)
    } else {
      return Promise.resolve(res)
    }
  },
  (error) => {
    //响应错误
    if (error.message.includes('timeout')) {
      ElMessage.closeAll()
      ElMessage.error('请求超时，请稍后重试！')
    } else if (error.message.includes('Network Error')) {
      ElMessage.closeAll()
      ElMessage.error('网络异常，请稍后重试！')
    } else if (error.message.includes('Request') !== -1) {
      ElMessage.closeAll()
      ElMessage.error('请求异常，请稍后重试！')
    }
    return Promise.reject(error)
  },
)

//通用get,post请求方法
/**
 * 通用请求方法
 * param config 请求配置
 */
export const http = (config: AxiosRequestConfig<any>) => {
  return service.request(config)
}

/**
 * 通用GET请求方法
 */
export const get = (url: string, params: any) => {
  return http({
    url: url,
    method: 'get',
    params: params,
  })
}

/**
 * 通用POST请求方法
 */
export const post = (url: string, data: {}) => {
  return http({
    url: url,
    method: 'post',
    data: data,
  })
}

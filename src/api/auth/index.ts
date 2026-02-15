import { get, post } from '@/utils/request'
import type { LoginRequest, LoginResponse, CaptchaResponse, CaptchaCheckResponse } from '@/types/api/auth'
import type { LoginUserInfoResponse } from '@/types/api/user'
import type { ApiResponse } from '@/types/global'

export const authApi = {
  /**
   * 用户登录
   * @param param 登录参数
   * @returns 登录结果
   */
  login: (param: LoginRequest) => {
    return post<ApiResponse<LoginResponse>>('/api/auth/login', param)
  },

  /**
   * 退出登录
   * @returns 请求结果
   */
  logout: () => {
    return post<ApiResponse<void>>('/api/auth/logout', {})
  },

  /**
   * 获取验证码
   * @returns 验证码信息
   */
  getCaptcha: () => {
    return get<ApiResponse<CaptchaResponse>>('/api/auth/captcha/get', {})
  },

  /**
   * 检查验证码
   * @param captchaKey 验证码键
   * @param captchaCode 验证码
   * @returns 验证结果
   */
  checkCaptcha: (captchaKey: string, captchaCode: string) => {
    return get<ApiResponse<CaptchaCheckResponse>>('/api/auth/captcha/check', { captchaKey, captchaCode })
  },

  /**
   * 刷新token
   * @returns 新的token
   */
  refreshToken: () => {
    return post<ApiResponse<LoginResponse>>('/api/auth/refresh-token', {})
  },

  /**
   * 获取当前登录用户信息
   * @returns 用户信息
   */
  getCurrentUser: () => {
    return get<ApiResponse<LoginUserInfoResponse>>('/api/auth/me', {})
  },
}
import { get } from '@/utils/request'

export const captchaApi = {
  /**
   * 获取验证码
   * param param 请求参数
   * return 请求结果
   */
  get: () => {
    return get('/captcha/get', {})
  },
}

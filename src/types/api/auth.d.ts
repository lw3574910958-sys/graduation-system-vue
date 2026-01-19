// 登录请求类型
export interface LoginRequest {
  username: string
  password: string
  captchaCode: string
  captchaKey: string
}

// 登录响应类型
export interface LoginResponse {
  token: string
}

// 验证码响应类型
export interface CaptchaResponse {
  captchaImg: string
  captchaId: string
}

// 验证码检查响应类型
export interface CaptchaCheckResponse {
  valid: boolean
}


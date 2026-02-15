// 用户信息响应类型
export interface UserResponse {
  id: number
  username: string
  realName: string
  userType: string
  status?: number
  createdAt?: string
  updatedAt?: string
  lastLoginAt?: string
  avatar?: string
}

// 用户创建请求类型
export interface UserCreateRequest {
  username: string
  realName: string
  userType: string
  password: string
  status?: number
  avatar?: string
}

// 用户更新请求类型
export interface UserUpdateRequest {
  realName?: string
  userType?: string
  status?: number
  avatar?: string
}

// 用户分页响应类型
export interface UserPageResponse {
  records: UserResponse[]
  total: number
  current: number
  size: number
  pages: number
}

// 登录用户信息类型
export interface LoginUserInfoResponse {
  id: number
  username: string
  realName: string
  userType: string
  createdAt?: string
}



// 用户查询参数类型
export interface UserQueryParams {
  username?: string
  realName?: string
  userType?: string
  status?: number
  current?: number
  size?: number
}
// 用户信息响应类型 (对应后端 UserListInfoVO)
export interface UserResponse {
  id: string  // 使用 string 类型避免 JavaScript Number 精度丢失
  username: string
  realName: string
  userType: string
  email?: string
  phone?: string
  departmentId?: number
  departmentName?: string
  status: number
  createdAt?: string
  updatedAt?: string
  lastLoginAt?: string
  avatar?: string
}

// 用户创建请求类型 (与后端 UserCreateDTO 完全对应)
export interface UserCreateRequest {
  username: string
  realName: string
  userType: string
  password: string
  email?: string
  phone?: string
  departmentId?: number
  status?: number
  avatar?: string
}

// 用户更新请求类型
export interface UserUpdateRequest {
  realName?: string
  userType?: string
  password?: string  // 编辑时可选，不传则不修改密码
  email?: string
  phone?: string
  departmentId?: number
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
  id: string  // 使用 string 类型避免 JavaScript Number 精度丢失
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
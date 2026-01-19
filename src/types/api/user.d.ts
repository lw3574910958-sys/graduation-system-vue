// 用户信息响应类型
export interface UserResponse {
  id: number
  username: string
  realName: string
  userType: string
  createdAt?: Date
}

// 用户分页响应类型
export interface UserPageResponse {
  records: UserResponse[]
  total: number
  current: number
  size: number
  pages: number
}
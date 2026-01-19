// 院系信息响应类型
export interface DepartmentResponse {
  id: number
  name: string
  code: string
  description: string
  createdAt?: Date
}

// 院系分页响应类型
export interface DepartmentPageResponse {
  records: DepartmentResponse[]
  total: number
  current: number
  size: number
  pages: number
}
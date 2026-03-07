// 学生详细信息响应类型
export interface StudentDetailResponse {
  id: number
  userId: number
  studentId: string
  departmentId: number
  gender: number
  major: string
  className: string
  phone?: string
  email?: string
  createdAt?: string
  updatedAt?: string
}

// 学生创建请求类型
export interface StudentCreateRequest {
  userId: number
  studentId: string
  departmentId: number
  gender: number
  major: string
  className: string
  phone?: string
  email?: string
}

// 学生更新请求类型
export interface StudentUpdateRequest {
  studentId?: string
  departmentId?: number
  gender?: number
  major?: string
  className?: string
  phone?: string
  email?: string
}

// 学生分页响应类型
export interface StudentPageResponse {
  records: StudentDetailResponse[]
  total: number
  current: number
  size: number
  pages: number
}

// 学生查询参数类型
export interface StudentQueryParams {
  studentId?: string
  major?: string
  className?: string
  departmentId?: number
  gender?: number
  current?: number
  size?: number
}
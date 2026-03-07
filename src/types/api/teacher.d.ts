// 教师详细信息响应类型
export interface TeacherDetailResponse {
  id: number
  userId: number
  teacherId: string
  departmentId: number
  gender: number
  title: string
  phone?: string
  email?: string
  createdAt?: string
  updatedAt?: string
}

// 教师创建请求类型
export interface TeacherCreateRequest {
  userId: number
  teacherId: string
  departmentId: number
  gender: number
  title: string
  phone?: string
  email?: string
}

// 教师更新请求类型
export interface TeacherUpdateRequest {
  teacherId?: string
  departmentId?: number
  gender?: number
  title?: string
  phone?: string
  email?: string
}

// 教师分页响应类型
export interface TeacherPageResponse {
  records: TeacherDetailResponse[]
  total: number
  current: number
  size: number
  pages: number
}

// 教师查询参数类型
export interface TeacherQueryParams {
  teacherId?: string
  title?: string
  departmentId?: number
  gender?: number
  current?: number
  size?: number
}
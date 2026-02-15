// 题目信息响应类型
export interface TopicResponse {
  id: number
  title: string
  description: string
  requirement: string
  difficulty: string
  status: number
  teacherId: number
  departmentId: number
  maxStudents: number
  selectedCount: number
  createdAt?: string
  updatedAt?: string
}

// 题目创建请求类型
export interface TopicCreateRequest {
  title: string
  description: string
  requirement: string
  difficulty: string
  status: number
  teacherId: number
  departmentId: number
  maxStudents: number
}

// 题目更新请求类型
export interface TopicUpdateRequest {
  title?: string
  description?: string
  requirement?: string
  difficulty?: string
  status?: number
  teacherId?: number
  departmentId?: number
  maxStudents?: number
}

// 题目查询参数类型
export interface TopicQueryParams {
  title?: string
  difficulty?: string
  status?: number
  teacherId?: number
  departmentId?: number
  current?: number
  size?: number
}

// 题目分页响应类型
export interface TopicPageResponse {
  records: TopicResponse[]
  total: number
  current: number
  size: number
  pages: number
}
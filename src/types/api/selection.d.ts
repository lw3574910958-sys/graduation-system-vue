// 选题信息响应类型
export interface SelectionResponse {
  id: number
  studentId: number
  topicId: number
  teacherId: number
  status: number
  score?: number
  comment?: string
  createdAt?: string
  updatedAt?: string
}

// 选题创建请求类型
export interface SelectionCreateRequest {
  studentId: number
  topicId: number
  teacherId: number
  status: number
}

// 选题更新请求类型
export interface SelectionUpdateRequest {
  status?: number
  score?: number
  comment?: string
}

// 选题查询参数类型
export interface SelectionQueryParams {
  studentId?: number
  topicId?: number
  teacherId?: number
  status?: number
  current?: number
  size?: number
}

// 选题分页响应类型
export interface SelectionPageResponse {
  records: SelectionResponse[]
  total: number
  current: number
  size: number
  pages: number
}
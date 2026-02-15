// 成绩信息响应类型
export interface GradeResponse {
  id: number
  studentId: number
  topicId: number
  teacherId: number
  score: number
  comment?: string
  status: number
  createdAt?: string
  updatedAt?: string
}

// 成绩创建/更新请求类型
export interface GradeRequest {
  studentId: number
  topicId: number
  teacherId: number
  score: number
  comment?: string
  status: number
}

// 成绩查询参数类型
export interface GradeQueryParams {
  studentId?: number
  topicId?: number
  teacherId?: number
  status?: number
  current?: number
  size?: number
}

// 成绩分页响应类型
export interface GradePageResponse {
  records: GradeResponse[]
  total: number
  current: number
  size: number
  pages: number
}
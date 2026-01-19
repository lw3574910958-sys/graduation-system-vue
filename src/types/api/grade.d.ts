// 成绩信息响应类型
export interface GradeResponse {
  id: number
  studentId: number
  studentName?: string
  topicId: number
  topicTitle?: string
  score?: number
  graderId?: number
  comment?: string
  gradedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

// 成绩分页响应类型
export interface GradePageResponse {
  records: GradeResponse[]
  total: number
  current: number
  size: number
  pages: number
}
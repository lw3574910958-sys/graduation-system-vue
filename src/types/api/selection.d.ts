// 选题信息响应类型
export interface SelectionResponse {
  id: number
  topicId: number
  topicTitle: string
  studentId: number
  studentName: string
  teacherId: number
  teacherName: string
  status: string
  createdAt?: Date
  updatedAt?: Date
}

// 选题分页响应类型
export interface SelectionPageResponse {
  records: SelectionResponse[]
  total: number
  current: number
  size: number
  pages: number
}
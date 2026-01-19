// 选题信息响应类型
export interface SelectionResponse {
  id: number
  studentId: number
  studentName?: string
  topicId: number
  topicTitle?: string
  status: number
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
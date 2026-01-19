// 过程记录信息响应类型
export interface ProcessResponse {
  id: number
  title: string
  studentId: number
  studentName: string
  topicId: number
  topicTitle: string
  status: string
  description: string
  createdAt?: Date
  updatedAt?: Date
}

// 过程记录分页响应类型
export interface ProcessPageResponse {
  records: ProcessResponse[]
  total: number
  current: number
  size: number
  pages: number
}
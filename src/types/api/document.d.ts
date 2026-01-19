// 文档信息响应类型
export interface DocumentResponse {
  id: number
  title: string
  fileName: string
  fileSize: number
  fileType: string
  filePath: string
  studentId: number
  studentName: string
  topicId: number
  topicTitle: string
  uploadTime?: Date
  status: string
}

// 文档分页响应类型
export interface DocumentPageResponse {
  records: DocumentResponse[]
  total: number
  current: number
  size: number
  pages: number
}
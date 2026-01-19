// 文档信息响应类型
export interface DocumentResponse {
  id: number
  userId: number
  topicId: number
  fileType: number
  originalFilename: string
  storedPath?: string
  fileSize: number
  reviewStatus: number
  reviewedAt?: Date
  reviewerId?: number
  feedback?: string
  uploadedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

// 文档分页响应类型
export interface DocumentPageResponse {
  records: DocumentResponse[]
  total: number
  current: number
  size: number
  pages: number
}
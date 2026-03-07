// 文档信息响应类型 (对应后端 DocumentVO)
export interface DocumentResponse {
  id: number
  userId: number
  userName: string
  topicId: number
  topicTitle: string
  fileType: number
  fileTypeDesc: string
  originalFilename: string
  fileSize: number
  fileSizeDisplay: string
  fileExtension: string
  reviewStatus: number
  reviewStatusDesc: string
  reviewedAt?: string
  reviewerId?: number
  reviewerName?: string
  feedback?: string
  uploadedAt?: string
  createdAt?: string
  updatedAt?: string
}

// 文档上传请求类型 (对应后端 DocumentUploadDTO)
export interface DocumentUploadRequest {
  topicId: number
  fileType: number
  file: File
  description?: string
  version?: string
}

// 文档更新请求类型
export interface DocumentUpdateRequest {
  name?: string
  status?: number
  comment?: string
}

// 文档审核请求类型 (对应后端 DocumentReviewDTO)
export interface DocumentReviewRequest {
  documentId: number
  reviewStatus: number  // 1-通过, 2-驳回
  feedback?: string
  suggestion?: string
}

// 文档查询参数类型 (对应后端 DocumentPageQueryDTO)
export interface DocumentQueryParams {
  userId?: number
  topicId?: number
  fileType?: number
  reviewStatus?: number
  keyword?: string
  departmentId?: number
  current?: number
  size?: number
}

// 文档分页响应类型
export interface DocumentPageResponse {
  records: DocumentResponse[]
  total: number
  current: number
  size: number
  pages: number
}
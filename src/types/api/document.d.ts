// 文档信息响应类型
export interface DocumentResponse {
  id: number
  name: string
  url: string
  type: string
  size: number
  userId: number
  businessId: number
  businessType: string
  status: number
  createdAt?: string
  updatedAt?: string
}

// 文档上传请求类型
export interface DocumentUploadRequest {
  file: File
  businessId: number
  businessType: string
  name?: string
}

// 文档更新请求类型
export interface DocumentUpdateRequest {
  name?: string
  status?: number
  comment?: string
}

// 文档查询参数类型
export interface DocumentQueryParams {
  name?: string
  type?: string
  userId?: number
  businessId?: number
  businessType?: string
  status?: number
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
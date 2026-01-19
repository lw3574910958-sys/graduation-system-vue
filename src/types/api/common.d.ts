// 上传文件响应类型
export interface UploadFileResponse {
  name: string
  url: string
  size: number
  type: string
  originalName: string
  uploadTime: string
}

// 上传响应类型
export interface UploadResponse {
  code: number
  message: string
  data: UploadFileResponse
}
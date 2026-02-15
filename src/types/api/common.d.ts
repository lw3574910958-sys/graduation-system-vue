import type { ApiResponse } from '../global'

// 上传文件响应类型
export interface UploadFileResponse {
  name: string
  url: string
  size: number
  type: string
  storedPath: string
}

// 上传响应类型（使用全局统一格式）
type UploadResponse = ApiResponse<UploadFileResponse>

export type { UploadResponse }
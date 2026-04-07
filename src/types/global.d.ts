/**
 * 全局类型定义
 */

// 分页查询参数
export interface PageQuery {
  current?: number
  size?: number
  [key: string]: any
}

// 分页响应结构（与后端IPage保持一致）
export interface PageResponse<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages: number
}

// 响应数据结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

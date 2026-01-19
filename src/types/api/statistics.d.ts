// 统计信息响应类型
export interface StatisticsResponse {
  id: number
  name: string
  type: string
  value: number
  description: string
  createdAt?: Date
  updatedAt?: Date
}

// 统计分页响应类型
export interface StatisticsPageResponse {
  records: StatisticsResponse[]
  total: number
  current: number
  size: number
  pages: number
}
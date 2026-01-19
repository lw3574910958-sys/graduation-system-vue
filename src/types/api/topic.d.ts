// 题目信息响应类型
export interface TopicResponse {
  id: number
  title: string
  description: string
  teacherId: number
  status: number
  createdAt?: Date
  updatedAt?: Date
}

// 题目分页响应类型
export interface TopicPageResponse {
  records: TopicResponse[]
  total: number
  current: number
  size: number
  pages: number
}
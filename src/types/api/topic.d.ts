// 题目信息响应类型 (对应后端 TopicVO)
export interface TopicResponse {
  id: number
  title: string
  description: string
  teacherId: number
  status: number
  departmentId: number
  source?: string
  type?: string
  nature?: string
  difficulty?: number
  workload?: number
  maxSelections?: number
  selectedCount: number
  teacherNumber?: string  // 发布教师工号
  departmentName?: string  // 院系名称
  createdAt?: string
  updatedAt?: string
}

// 题目创建请求类型 (对应后端 TopicCreateDTO)
export interface TopicCreateRequest {
  title: string
  description: string
  departmentId: number
  source?: string
  type?: string
  nature?: string
  difficulty?: number
  workload?: number
  maxSelections?: number
}

// 题目更新请求类型 (对应后端 TopicUpdateDTO)
export interface TopicUpdateRequest {
  id: number | string
  title: string
  description: string
  source?: string
  type?: string
  nature?: string
  difficulty?: number
  workload?: number
  maxSelections?: number
  status?: number
}

// 题目查询参数类型 (对应后端 TopicPageQueryDTO)
export interface TopicQueryParams {
  title?: string
  teacherId?: number
  status?: number
  current?: number
  size?: number
}

// 题目分页响应类型
export interface TopicPageResponse {
  records: TopicResponse[]
  total: number
  current: number
  size: number
  pages: number
}
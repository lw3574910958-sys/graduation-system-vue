// 题目信息响应类型 (对应后端 TopicVO)
export interface TopicResponse {
  id: string
  title: string
  description: string
  /** 发布教师 ID - 仅系统管理员可见 */
  teacherId?: string
  status: number
  /** 所属院系 ID - 仅系统管理员可见 */
  departmentId?: string
  source?: string
  type?: string
  nature?: string
  difficulty?: number
  workload?: number
  maxSelections?: number
  selectedCount: number
  teacherNumber?: string  // 发布教师工号
  teacherName?: string  // 发布教师姓名
  departmentName?: string  // 院系名称
  departmentCode?: string  // 院系编码
  lastReviewOutcome?: number  // 最近一次审核结果：NULL-未审，1-通过，2-驳回
  lastReviewFeedback?: string  // 最近一次审核意见
  reviewerId?: string  // 审核人 ID
  reviewerName?: string  // 审核人姓名
  reviewedAt?: string  // 审核时间
  createdAt?: string
  updatedAt?: string
}

// 题目创建请求类型 (对应后端 TopicCreateDTO)
// 注意：departmentId 和 teacherId 由后端根据登录用户信息自动填充，前端不需要传递
export interface TopicCreateRequest {
  title: string
  description: string
  source?: string
  type?: string
  nature?: string
  difficulty?: number
  workload?: number
  maxSelections?: number
  status?: number  // 0-暂存为草稿，1-直接提交审核
}

// 题目更新请求类型 (对应后端 TopicUpdateDTO)
export interface TopicUpdateRequest {
  id: string
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
  teacherId?: string
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
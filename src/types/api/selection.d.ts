// 选题信息响应类型 (对应后端 SelectionVO)
export interface SelectionResponse {
  id: number
  studentId: number
  studentName: string
  studentNumber?: string  // 学号
  topicId: number
  topicTitle: string
  status: number
  statusDesc: string
  reviewerId?: number
  reviewerName?: string
  reviewComment?: string
  applyReason?: string    // 申请理由
  studentAbility?: string // 学生能力说明
  expectedGoal?: string   // 预期目标
  reviewedAt?: string
  confirmedAt?: string
  createdAt: string
  updatedAt: string
}

// 选题申请请求类型 (对应后端 SelectionApplyDTO)
export interface SelectionApplyRequest {
  topicId: number
  applyReason?: string
  studentAbility?: string
  expectedGoal?: string
}

// 选题审核请求类型 (对应后端 SelectionReviewDTO)
export interface SelectionReviewRequest {
  selectionId: number
  reviewResult: number  // 1-通过, 2-驳回
  reviewComment?: string
  suggestedChanges?: string
  remark?: string
}

// 选题创建请求类型 (通用创建接口)
export interface SelectionCreateRequest {
  studentId: number
  topicId: number
  status: number
}

// 选题更新请求类型
export interface SelectionUpdateRequest {
  status?: number
  reviewComment?: string
}

// 选题查询参数类型
export interface SelectionQueryParams {
  studentId?: number
  topicId?: number
  teacherId?: number
  status?: number
  current?: number
  size?: number
}

// 选题分页响应类型
export interface SelectionPageResponse {
  records: SelectionResponse[]
  total: number
  current: number
  size: number
  pages: number
}
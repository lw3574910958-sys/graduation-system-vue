// 成绩信息响应类型 (对应后端 GradeVO)
export interface GradeResponse {
  id: string
  studentId: string
  studentName: string
  studentNumber: string
  topicId: string
  topicTitle: string
  graderId: string
  graderName: string
  score: number
  gradeLevel?: string
  gpa?: number
  comment?: string
  passing: boolean
  excellent: boolean
  gradedAt?: string
  createdAt: string
  updatedAt: string
}

// 成绩录入请求类型 (对应后端 GradeInputDTO)
export interface GradeInputRequest {
  studentId: string
  topicId: string
  graderId: string
  score: number
  comment?: string
  gradeLevel?: string
  gpa?: number
}

// 成绩创建/更新请求类型 (通用接口)
export interface GradeRequest {
  studentId: string
  topicId: string
  graderId: string
  score: number
  comment?: string
  status: number
}

// 成绩查询参数类型
export interface GradeQueryParams {
  studentId?: string
  topicId?: string
  teacherId?: string
  status?: number
  current?: number
  size?: number
}

// 成绩分页响应类型
export interface GradePageResponse {
  records: GradeResponse[]
  total: number
  current: number
  size: number
  pages: number
}
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
  graderWorkNumber?: string // 评分教师工号
  gradeType?: number
  gradeTypeDesc?: string
  score?: number // 可以为 null/undefined，未评分时为空
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
  gradeType: number // 0-开题报告，1-中期报告，2-毕业论文，3-综合成绩
  score: number
  comment?: string
  gradeLevel?: string
  gpa?: number
}

// 成绩查询参数类型
export interface GradeQueryParams {
  studentId?: string
  topicId?: string
  gradeType?: number // 成绩类型：0-开题报告，1-中期报告，2-毕业论文，3-综合成绩
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
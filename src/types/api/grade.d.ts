// 成绩信息响应类型
export interface GradeResponse {
  id: number
  studentId: number
  studentName: string
  topicId: number
  topicTitle: string
  teacherId: number
  teacherName: string
  score: number
  comment: string
  submitDate?: Date
  reviewDate?: Date
  status: string
}

// 成绩分页响应类型
export interface GradePageResponse {
  records: GradeResponse[]
  total: number
  current: number
  size: number
  pages: number
}
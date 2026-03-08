// 学生详细信息响应类型
export interface StudentDetailResponse {
  id: number
  userId: number | string
  studentId: string
  departmentId: number
  gender: number
  major: string
  className: string
  phone?: string
  email?: string
  createdAt?: string
  updatedAt?: string
}

// 教师详细信息响应类型
export interface TeacherDetailResponse {
  id: number
  userId: number | string
  teacherId: string
  departmentId: number
  gender: number
  title: string
  phone?: string
  email?: string
  createdAt?: string
  updatedAt?: string
}

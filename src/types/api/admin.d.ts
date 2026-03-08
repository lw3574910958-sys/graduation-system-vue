// 管理员详细信息响应类型
export interface AdminDetailResponse {
  id: number
  userId: number | string
  adminId: string
  departmentId?: number | null
  departmentName?: string | null
  roleLevel?: number | null
  roleLevelDesc?: string | null
  phone?: string
  email?: string
  createdAt?: string
  updatedAt?: string
}

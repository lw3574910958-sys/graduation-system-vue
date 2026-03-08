import { get } from '@/utils/request'
import type { StudentDetailResponse } from '@/types/api/student'
import type { ApiResponse } from '@/types/global'

export const studentApi = {
  /**
   * 根据用户 ID 获取学生详情
   * @param userId 用户 ID
   * @returns 学生详情
   */
  getStudentByUserId: (userId: number | string) => {
    return get<ApiResponse<StudentDetailResponse>>(`/api/users/student/${userId}`, {})
  },
}

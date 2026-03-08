import { get } from '@/utils/request'
import type { TeacherDetailResponse } from '@/types/api/teacher'
import type { ApiResponse } from '@/types/global'

export const teacherApi = {
  /**
   * 根据用户 ID 获取教师详情
   * @param userId 用户 ID
   * @returns 教师详情
   */
  getTeacherByUserId: (userId: number | string) => {
    return get<ApiResponse<TeacherDetailResponse>>(`/api/users/teacher/${userId}`, {})
  },
}

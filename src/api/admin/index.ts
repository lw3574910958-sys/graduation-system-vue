import { get } from '@/utils/request'
import type { AdminDetailResponse } from '@/types/api/admin'
import type { ApiResponse } from '@/types/global'

/**
 * 管理员 API
 */
export const adminApi = {
  /**
   * 根据用户 ID 获取管理员详情
   * @param userId 用户 ID
   * @returns 管理员详情
   */
  getAdminByUserId: (userId: number | string) => {
    return get<ApiResponse<AdminDetailResponse>>(`/api/users/admin/${userId}`)
  },
}

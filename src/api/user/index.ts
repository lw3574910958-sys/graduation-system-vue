import { get, post, put, del } from '@/utils/request'
import type {
  UserResponse,
  UserPageResponse,
  UserCreateRequest,
  UserUpdateRequest,
  UserQueryParams,
} from '@/types/api/user'
import type { ApiResponse, PageQuery } from '@/types/global'

export const userApi = {
  /**
   * 分页查询用户列表
   * @param params 查询参数
   * @returns 分页结果
   */
  getUserPage: (params: UserQueryParams) => {
    return get<ApiResponse<UserPageResponse>>('/api/users/page', params)
  },

  /**
   * 根据ID获取用户详情
   * @param id 用户ID
   * @returns 用户详情
   */
  getUserById: (id: number | string) => {
    return get<ApiResponse<UserResponse>>(`/api/users/${id}`, {})
  },

  /**
   * 创建新用户
   * @param param 用户信息
   * @returns 请求结果
   */
  createUser: (param: UserCreateRequest) => {
    return post<ApiResponse<void>>('/api/users', param)
  },

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param param 用户信息
   * @returns 请求结果
   */
  updateUser: (id: number, param: UserUpdateRequest) => {
    return put<ApiResponse<void>>(`/api/users/${id}`, param)
  },

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 请求结果
   */
  deleteUser: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/users/${id}`)
  },

  /**
   * 重置用户密码
   * @param id 用户ID
   * @returns 请求结果
   */
  resetPassword: (id: number | string) => {
    return post<ApiResponse<void>>(`/api/users/${id}/reset-password`, {})
  },
}

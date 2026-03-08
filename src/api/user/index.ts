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
   * 根据 ID 获取用户详情
   * @param id 用户 ID
   * @returns 用户详情
   */
  getUserById: (id: string) => {
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
   * @param id 用户 ID
   * @param param 用户信息
   * @returns 请求结果
   */
  updateUser: (id: string, param: UserUpdateRequest) => {
    return put<ApiResponse<void>>(`/api/users/${id}`, param)
  },
  
  /**
   * 删除用户
   * @param id 用户 ID
   * @returns 请求结果
   */
  deleteUser: (id: string) => {
    console.log('🔍 deleteUser API called with id:', id)
    return del<ApiResponse<void>>(`/api/users/${id}`)
  },
}

import { get, post, put, del } from '@/utils/request'
import type { ApiResponse, PageQuery } from '@/types/global'
import type { DepartmentResponse, DepartmentPageResponse } from '@/types/api/department'

// 院系相关API
export const departmentApi = {
  /**
   * 获取院系列表
   * @returns 院系列表
   */
  getList: (params?: PageQuery) => {
    return get<ApiResponse<DepartmentPageResponse>>('/api/departments', params || {})
  },

  /**
   * 根据ID获取院系详情
   * @param id 院系ID
   * @returns 院系详情
   */
  getById: (id: number | string) => {
    return get<ApiResponse<DepartmentResponse>>(`/api/departments/${id}`, {})
  },

  /**
   * 创建院系
   * @param param 院系信息
   * @returns 请求结果
   */
  create: (param: Omit<DepartmentResponse, 'id'>) => {
    return post<ApiResponse<void>>('/api/departments', param)
  },

  /**
   * 更新院系
   * @param id 院系ID
   * @param param 院系信息
   * @returns 请求结果
   */
  update: (id: number | string, param: Partial<Omit<DepartmentResponse, 'id'>>) => {
    return put<ApiResponse<void>>(`/api/departments/${id}`, param)
  },

  /**
   * 删除院系
   * @param id 院系ID
   * @returns 请求结果
   */
  delete: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/departments/${id}`)
  }
}
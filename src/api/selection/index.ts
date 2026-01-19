import { get, post, put, del } from '@/utils/request'
import type { ApiResponse, PageQuery } from '@/types/global'
import type { SelectionResponse, SelectionPageResponse } from '@/types/api/selection'

// 选题相关API
export const selectionApi = {
  /**
   * 获取选题列表
   * @param params 查询参数
   * @returns 选题列表
   */
  getList: (params: PageQuery) => {
    return get<ApiResponse<SelectionPageResponse>>('/api/selection/list', params)
  },

  /**
   * 根据ID获取选题详情
   * @param id 选题ID
   * @returns 选题详情
   */
  getById: (id: number | string) => {
    return get<ApiResponse<SelectionResponse>>(`/api/selection/${id}`, {})
  },

  /**
   * 创建选题
   * @param param 选题信息
   * @returns 请求结果
   */
  create: (param: Omit<SelectionResponse, 'id'>) => {
    return post<ApiResponse<void>>('/api/selection', param)
  },

  /**
   * 更新选题
   * @param id 选题ID
   * @param param 选题信息
   * @returns 请求结果
   */
  update: (id: number | string, param: Partial<Omit<SelectionResponse, 'id'>>) => {
    return put<ApiResponse<void>>(`/api/selection/${id}`, param)
  },

  /**
   * 删除选题
   * @param id 选题ID
   * @returns 请求结果
   */
  delete: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/selection/${id}`)
  }
}
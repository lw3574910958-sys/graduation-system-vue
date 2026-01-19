import { get, post, put, del } from '@/utils/request'
import type { ApiResponse, PageQuery } from '@/types/global'
import type { StatisticsResponse, StatisticsPageResponse } from '@/types/api/statistics'

// 数据统计相关API
export const statisticsApi = {
  /**
   * 获取统计数据
   * @param params 查询参数
   * @returns 统计数据
   */
  getStats: (params: PageQuery) => {
    return get<ApiResponse<StatisticsPageResponse>>('/api/statistics', params)
  },

  /**
   * 获取统计详情
   * @param id 统计ID
   * @returns 统计详情
   */
  getStatById: (id: number | string) => {
    return get<ApiResponse<StatisticsResponse>>(`/api/statistics/${id}`, {})
  },

  /**
   * 创建统计
   * @param param 统计信息
   * @returns 请求结果
   */
  create: (param: Omit<StatisticsResponse, 'id'>) => {
    return post<ApiResponse<void>>('/api/statistics', param)
  },

  /**
   * 更新统计
   * @param id 统计ID
   * @param param 统计信息
   * @returns 请求结果
   */
  update: (id: number | string, param: Partial<Omit<StatisticsResponse, 'id'>>) => {
    return put<ApiResponse<void>>(`/api/statistics/${id}`, param)
  },

  /**
   * 删除统计
   * @param id 统计ID
   * @returns 请求结果
   */
  delete: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/statistics/${id}`)
  }
}
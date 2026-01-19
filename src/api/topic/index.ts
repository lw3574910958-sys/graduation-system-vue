import { get, post, put, del } from '@/utils/request'
import type { ApiResponse, PageQuery } from '@/types/global'
import type { TopicResponse, TopicPageResponse } from '@/types/api/topic'

// 题目相关API
export const topicApi = {
  /**
   * 获取题目列表
   * @param params 查询参数
   * @returns 题目列表
   */
  getList: (params: PageQuery) => {
    return get<ApiResponse<TopicPageResponse>>('/api/topic/list', params)
  },

  /**
   * 根据ID获取题目详情
   * @param id 题目ID
   * @returns 题目详情
   */
  getById: (id: number | string) => {
    return get<ApiResponse<TopicResponse>>(`/api/topic/${id}`, {})
  },

  /**
   * 创建题目
   * @param param 题目信息
   * @returns 请求结果
   */
  create: (param: Omit<TopicResponse, 'id'>) => {
    return post<ApiResponse<void>>('/api/topic', param)
  },

  /**
   * 更新题目
   * @param id 题目ID
   * @param param 题目信息
   * @returns 请求结果
   */
  update: (id: number | string, param: Partial<Omit<TopicResponse, 'id'>>) => {
    return put<ApiResponse<void>>(`/api/topic/${id}`, param)
  },

  /**
   * 删除题目
   * @param id 题目ID
   * @returns 请求结果
   */
  delete: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/topic/${id}`)
  }
}
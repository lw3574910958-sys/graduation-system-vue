import { get, post, put, del } from '@/utils/request'
import type { ApiResponse, PageQuery } from '@/types/global'
import type { ProcessResponse, ProcessPageResponse } from '@/types/api/process'

// 过程记录相关API
export const processApi = {
  /**
   * 获取过程记录列表
   * @param params 查询参数
   * @returns 过程记录列表
   */
  getList: (params: PageQuery) => {
    return get<ApiResponse<ProcessPageResponse>>('/api/processes', params)
  },

  /**
   * 根据ID获取过程记录详情
   * @param id 过程记录ID
   * @returns 过程记录详情
   */
  getById: (id: number | string) => {
    return get<ApiResponse<ProcessResponse>>(`/api/processes/${id}`, {})
  },

  /**
   * 创建过程记录
   * @param param 过程记录信息
   * @returns 请求结果
   */
  create: (param: Omit<ProcessResponse, 'id'>) => {
    return post<ApiResponse<void>>('/api/processes', param)
  },

  /**
   * 更新过程记录
   * @param id 过程记录ID
   * @param param 过程记录信息
   * @returns 请求结果
   */
  update: (id: number | string, param: Partial<Omit<ProcessResponse, 'id'>>) => {
    return put<ApiResponse<void>>(`/api/processes/${id}`, param)
  },

  /**
   * 删除过程记录
   * @param id 过程记录ID
   * @returns 请求结果
   */
  delete: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/processes/${id}`)
  }
}
import { get, post, put, del } from '@/utils/request'
import type { ApiResponse, PageQuery } from '@/types/global'
import type { DocumentResponse, DocumentPageResponse } from '@/types/api/document'

// 文档相关API
export const documentApi = {
  /**
   * 获取文档列表
   * @param params 查询参数
   * @returns 文档列表
   */
  getList: (params: PageQuery) => {
    return get<ApiResponse<DocumentPageResponse>>('/api/documents', params)
  },

  /**
   * 根据ID获取文档详情
   * @param id 文档ID
   * @returns 文档详情
   */
  getById: (id: number | string) => {
    return get<ApiResponse<DocumentResponse>>(`/api/documents/${id}`, {})
  },

  /**
   * 创建文档
   * @param param 文档信息
   * @returns 请求结果
   */
  create: (param: Omit<DocumentResponse, 'id'>) => {
    return post<ApiResponse<void>>('/api/documents', param)
  },

  /**
   * 更新文档
   * @param id 文档ID
   * @param param 文档信息
   * @returns 请求结果
   */
  update: (id: number | string, param: Partial<Omit<DocumentResponse, 'id'>>) => {
    return put<ApiResponse<void>>(`/api/documents/${id}`, param)
  },

  /**
   * 删除文档
   * @param id 文档ID
   * @returns 请求结果
   */
  delete: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/documents/${id}`)
  }
}
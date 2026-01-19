import { get, post, put, del } from '@/utils/request'
import type { ApiResponse, PageQuery } from '@/types/global'
import type { GradeResponse, GradePageResponse } from '@/types/api/grade'

// 成绩相关API
export const gradeApi = {
  /**
   * 获取成绩列表
   * @param params 查询参数
   * @returns 成绩列表
   */
  getList: (params: PageQuery) => {
    return get<ApiResponse<GradePageResponse>>('/api/grades', params)
  },

  /**
   * 根据ID获取成绩详情
   * @param id 成绩ID
   * @returns 成绩详情
   */
  getById: (id: number | string) => {
    return get<ApiResponse<GradeResponse>>(`/api/grades/${id}`, {})
  },

  /**
   * 创建成绩
   * @param param 成绩信息
   * @returns 请求结果
   */
  create: (param: Omit<GradeResponse, 'id'>) => {
    return post<ApiResponse<void>>('/api/grades', param)
  },

  /**
   * 更新成绩
   * @param id 成绩ID
   * @param param 成绩信息
   * @returns 请求结果
   */
  update: (id: number | string, param: Partial<Omit<GradeResponse, 'id'>>) => {
    return put<ApiResponse<void>>(`/api/grades/${id}`, param)
  },

  /**
   * 删除成绩
   * @param id 成绩ID
   * @returns 请求结果
   */
  delete: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/grades/${id}`)
  }
}
import { get, post, put, del } from '@/utils/request'
import type {
  SelectionResponse,
  SelectionPageResponse,
  SelectionCreateRequest,
  SelectionUpdateRequest,
  SelectionQueryParams,
} from '@/types/api/selection'
import type { ApiResponse } from '@/types/global'

export const selectionApi = {
  // 为兼容视图组件而添加的别名方法
  create: (param: SelectionCreateRequest) => {
    return selectionApi.createSelection(param)
  },
  update: (id: number | string, param: SelectionUpdateRequest) => {
    return selectionApi.updateSelection(Number(id), param)
  },
  delete: (id: number | string) => {
    return selectionApi.deleteSelection(id)
  },
  getList: (params: SelectionQueryParams) => {
    return selectionApi.getSelectionPage(params)
  },
  
  /**
   * 分页查询选题列表
   * @param params 查询参数
   * @returns 分页结果
   */
  getSelectionPage: (params: SelectionQueryParams) => {
    return get<ApiResponse<SelectionPageResponse>>('/api/selections/page', params)
  },

  /**
   * 根据ID获取选题详情
   * @param id 选题ID
   * @returns 选题详情
   */
  getSelectionById: (id: number | string) => {
    return get<ApiResponse<SelectionResponse>>(`/api/selections/${id}`, {})
  },

  /**
   * 创建新选题
   * @param param 选题信息
   * @returns 请求结果
   */
  createSelection: (param: SelectionCreateRequest) => {
    return post<ApiResponse<void>>('/api/selections', param)
  },

  /**
   * 更新选题信息
   * @param id 选题ID
   * @param param 选题信息
   * @returns 请求结果
   */
  updateSelection: (id: number, param: SelectionUpdateRequest) => {
    return put<ApiResponse<void>>(`/api/selections/${id}`, param)
  },

  /**
   * 删除选题
   * @param id 选题ID
   * @returns 请求结果
   */
  deleteSelection: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/selections/${id}`)
  },

  /**
   * 获取学生选题记录
   * @param studentId 学生ID
   * @param params 查询参数
   * @returns 选题列表
   */
  getSelectionsByStudent: (studentId: number, params: SelectionQueryParams) => {
    return get<ApiResponse<SelectionPageResponse>>(`/api/selections/student/${studentId}`, params)
  },

  /**
   * 获取课题选题记录
   * @param topicId 课题ID
   * @param params 查询参数
   * @returns 选题列表
   */
  getSelectionsByTopic: (topicId: number, params: SelectionQueryParams) => {
    return get<ApiResponse<SelectionPageResponse>>(`/api/selections/topic/${topicId}`, params)
  },
}
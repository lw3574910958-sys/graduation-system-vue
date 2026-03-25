import { get, post, put, del } from '@/utils/request'
import type {
  TopicResponse,
  TopicPageResponse,
  TopicCreateRequest,
  TopicUpdateRequest,
  TopicQueryParams,
} from '@/types/api/topic'
import type { ApiResponse } from '@/types/global'

export const topicApi = {
  // 为兼容视图组件而添加的别名方法
  create: (param: TopicCreateRequest) => {
    return topicApi.createTopic(param)
  },
  update: (id: string, param: Omit<TopicUpdateRequest, 'id'>) => {
    // 注意：后端的 update 方法需要完整的 TopicUpdateRequest，包括 id
    const updateParam: TopicUpdateRequest = {
      id: id,
      ...param
    } as TopicUpdateRequest
    return topicApi.updateTopic(id, updateParam)
  },
  delete: (id: string) => {
    return topicApi.deleteTopic(id)
  },
  getList: (params: TopicQueryParams) => {
    return topicApi.getTopicPage(params)
  },
  
  /**
   * 分页查询题目列表
   * @param params 查询参数
   * @returns 分页结果
   */
  getTopicPage: (params: TopicQueryParams) => {
    return get<ApiResponse<TopicPageResponse>>('/api/topics/page', params)
  },

  /**
   * 根据ID获取题目详情
   * @param id 题目 ID
   * @returns 题目详情
   */
  getTopicById: (id: string) => {
    return get<ApiResponse<TopicResponse>>(`/api/topics/${id}`, {})
  },

  /**
   * 创建新题目
   * @param param 题目信息
   * @returns 请求结果
   */
  createTopic: (param: TopicCreateRequest) => {
    return post<ApiResponse<void>>('/api/topics', param)
  },

  /**
   * 更新题目信息
   * @param id 题目 ID
   * @param param 题目信息
   * @returns 请求结果
   */
  updateTopic: (id: string, param: TopicUpdateRequest) => {
    return put<ApiResponse<void>>(`/api/topics/${id}`, param)
  },

  /**
   * 删除题目
   * @param id 题目 ID
   * @returns 请求结果
   */
  deleteTopic: (id: string) => {
    return del<ApiResponse<void>>(`/api/topics/${id}`)
  },

  /**
   * 教师提交题目审核
   * @param id 题目 ID
   * @returns 操作结果
   */
  submitForReview: (id: string) => {
    return post<ApiResponse<void>>(`/api/topics/${id}/submit`, {})
  },

  /**
   * 撤销题目（仅草稿状态）
   * @param id 题目 ID
   * @returns 操作结果
   */
  revokeTopic: (id: string) => {
    return post<ApiResponse<void>>(`/api/topics/${id}/revoke`, {})
  },

  /**
   * 审核题目（院系管理员）
   * @param param 审核请求参数
   * @returns 审核结果
   */
  reviewTopic: (param: { topicId: string; reviewResult: number; reviewComment?: string }) => {
    return post<ApiResponse<void>>('/api/topics/review', param)
  },
  
  /**
   * 开放课题（教师用户）
   * @param id 课题 ID
   * @returns 操作结果
   */
  openTopic: (id: string) => {
    return post<ApiResponse<void>>(`/api/topics/${id}/open`, {})
  },
  
  /**
   * 关闭课题（教师用户）
   * @param id 课题 ID
   * @returns 操作结果
   */
  closeTopic: (id: string) => {
    return post<ApiResponse<void>>(`/api/topics/${id}/close`, {})
  },
}
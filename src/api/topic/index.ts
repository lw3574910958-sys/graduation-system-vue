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
  update: (id: number | string, param: TopicUpdateRequest) => {
    return topicApi.updateTopic(Number(id), param)
  },
  delete: (id: number | string) => {
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
   * @param id 题目ID
   * @returns 题目详情
   */
  getTopicById: (id: number | string) => {
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
   * @param id 题目ID
   * @param param 题目信息
   * @returns 请求结果
   */
  updateTopic: (id: number, param: TopicUpdateRequest) => {
    return put<ApiResponse<void>>(`/api/topics/${id}`, param)
  },

  /**
   * 删除题目
   * @param id 题目ID
   * @returns 请求结果
   */
  deleteTopic: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/topics/${id}`)
  },
}
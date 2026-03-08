import { get, post, put, del } from '@/utils/request'
import type {
  NoticeResponse,
  NoticeCreateRequest,
  NoticeUpdateRequest,
  NoticePageResponse,
  NoticeQueryParams
} from '@/types'
import type { ApiResponse } from '@/types/global'

/**
 * 通知管理API服务
 */
export const noticeApi = {
  /**
   * 分页查询通知列表
   * @param params 查询参数
   * @returns 通知分页数据
   */
  getNoticePage: (params: NoticeQueryParams) => {
    return get<ApiResponse<NoticePageResponse>>('/api/notices/page', params)
  },

  /**
   * 获取通知详情
   * @param id 通知 ID
   * @returns 通知详情
   */
  getNoticeById: (id: number | string) => {
    return get<ApiResponse<NoticeResponse>>(`/api/notices/${id}`)
  },

  /**
   * 创建通知
   * @param createRequest 创建参数
   * @returns 创建的通知
   */
  createNotice: (createRequest: NoticeCreateRequest) => {
    return post<ApiResponse<NoticeResponse>>('/api/notices', createRequest)
  },

  /**
   * 更新通知
   * @param id 通知 ID
   * @param updateRequest 更新参数
   * @returns 更新结果
   */
  updateNotice: (id: number | string, updateRequest: NoticeUpdateRequest) => {
    return put<ApiResponse<void>>(`/api/notices/${id}`, updateRequest)
  },
  
  /**
   * 发布通知
   * @param id 通知 ID
   * @returns 发布结果
   */
  publishNotice: (id: number | string) => {
    return post<ApiResponse<void>>(`/api/notices/${id}/publish`)
  },
  
  /**
   * 撤回通知
   * @param id 通知 ID
   * @returns 撤回结果
   */
  withdrawNotice: (id: number | string) => {
    return post<ApiResponse<void>>(`/api/notices/${id}/withdraw`)
  },
  
  /**
   * 删除通知
   * @param id 通知 ID
   * @returns 删除结果
   */
  deleteNotice: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/notices/${id}`)
  },

  /**
   * 获取置顶通知列表
   * @param targetScope 目标范围
   * @returns 置顶通知列表
   */
  getStickyNotices: (targetScope?: number) => {
    return get<ApiResponse<NoticeResponse[]>>('/api/notices/sticky', { targetScope })
  },

  /**
   * 获取最新通知列表
   * @param targetScope 目标范围
   * @param size 数量
   * @returns 最新通知列表
   */
  getLatestNotices: (targetScope?: number, size?: number) => {
    return get<ApiResponse<NoticeResponse[]>>('/api/notices/latest', { targetScope, size })
  },

  /**
   * 增加通知阅读次数
   * @param id 通知 ID
   * @returns 增加后的阅读次数
   */
  increaseReadCount: (id: number | string) => {
    return post<ApiResponse<number>>(`/api/notices/${id}/read`)
  }
}
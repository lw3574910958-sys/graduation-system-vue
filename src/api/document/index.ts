import { get, post, put, del } from '@/utils/request'
import type {
  DocumentResponse,
  DocumentPageResponse,
  DocumentUploadRequest,
  DocumentUpdateRequest,
  DocumentQueryParams,
} from '@/types/api/document'
import type { ApiResponse } from '@/types/global'

export const documentApi = {
  // 为兼容视图组件而添加的别名方法
  create: (param: DocumentUploadRequest) => {
    return documentApi.uploadDocument(param)
  },
  update: (id: number | string, param: DocumentUpdateRequest) => {
    return documentApi.updateDocument(Number(id), param)
  },
  delete: (id: number | string) => {
    return documentApi.deleteDocument(id)
  },
  getList: (params: DocumentQueryParams) => {
    return documentApi.getDocumentPage(params)
  },
  
  /**
   * 分页查询文档列表
   * @param params 查询参数
   * @returns 分页结果
   */
  getDocumentPage: (params: DocumentQueryParams) => {
    return get<ApiResponse<DocumentPageResponse>>('/api/documents/page', params)
  },

  /**
   * 根据ID获取文档详情
   * @param id 文档ID
   * @returns 文档详情
   */
  getDocumentById: (id: number | string) => {
    return get<ApiResponse<DocumentResponse>>(`/api/documents/${id}`, {})
  },

  /**
   * 上传文档
   * @param param 上传参数
   * @returns 上传结果
   */
  uploadDocument: (param: DocumentUploadRequest) => {
    const formData = new FormData()
    formData.append('file', param.file)
    formData.append('businessId', param.businessId.toString())
    formData.append('businessType', param.businessType)
    if (param.name) {
      formData.append('name', param.name)
    }
    
    return post<ApiResponse<DocumentResponse>>('/api/documents', formData)
  },

  /**
   * 更新文档信息
   * @param id 文档ID
   * @param param 更新参数
   * @returns 请求结果
   */
  updateDocument: (id: number, param: DocumentUpdateRequest) => {
    return put<ApiResponse<void>>(`/api/documents/${id}`, param)
  },

  /**
   * 审核文档
   * @param id 文档ID
   * @param param 审核参数
   * @returns 请求结果
   */
  reviewDocument: (id: number, param: DocumentUpdateRequest) => {
    return put<ApiResponse<void>>(`/api/documents/${id}/review`, param)
  },

  /**
   * 获取用户文档列表
   * @param userId 用户ID
   * @param params 查询参数
   * @returns 文档列表
   */
  getDocumentsByUser: (userId: number, params: DocumentQueryParams) => {
    return get<ApiResponse<DocumentPageResponse>>(`/api/documents/user/${userId}`, params)
  },

  /**
   * 获取选题文档列表
   * @param topicId 选题ID
   * @param params 查询参数
   * @returns 文档列表
   */
  getDocumentsByTopic: (topicId: number, params: DocumentQueryParams) => {
    return get<ApiResponse<DocumentPageResponse>>(`/api/documents/topic/${topicId}`, params)
  },

  /**
   * 获取指定类型文档列表
   * @param fileType 文件类型
   * @param params 查询参数
   * @returns 文档列表
   */
  getDocumentsByType: (fileType: number, params: DocumentQueryParams) => {
    return get<ApiResponse<DocumentPageResponse>>(`/api/documents/type/${fileType}`, params)
  },

  /**
   * 获取指定状态文档列表
   * @param reviewStatus 审核状态
   * @param params 查询参数
   * @returns 文档列表
   */
  getDocumentsByStatus: (reviewStatus: number, params: DocumentQueryParams) => {
    return get<ApiResponse<DocumentPageResponse>>(`/api/documents/status/${reviewStatus}`, params)
  },

  /**
   * 删除文档
   * @param id 文档ID
   * @returns 请求结果
   */
  deleteDocument: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/documents/${id}`)
  },
}
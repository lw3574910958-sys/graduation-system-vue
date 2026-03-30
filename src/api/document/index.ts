import { get, post, put, del } from '@/utils/request'
import type {
  DocumentResponse,
  DocumentPageResponse,
  DocumentUploadRequest,
  DocumentUpdateRequest,
  DocumentReviewRequest,
  DocumentQueryParams,
} from '@/types/api/document'
import type { ApiResponse } from '@/types/global'

export const documentApi = {
  // 为兼容视图组件而添加的别名方法
  create: (param: DocumentUploadRequest) => {
    return documentApi.uploadDocument(param)
  },
  update: (id: number | string, param: DocumentUpdateRequest) => {
    return documentApi.updateDocument(String(id), param)
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
    formData.append('topicId', param.topicId.toString())
    formData.append('fileType', param.fileType.toString())
    if (param.description) {
      formData.append('description', param.description)
    }
    if (param.version) {
      formData.append('version', param.version)
    }
    
    return post<ApiResponse<DocumentResponse>>('/api/documents/upload', formData)
  },

  /**
   * 学生重新上传文档（驳回后）
   * @param originalDocumentId 原文档 ID
   * @param param 上传参数
   * @returns 重新上传结果
   */
  reuploadDocument: (originalDocumentId: number | string, param: DocumentUploadRequest) => {
    const formData = new FormData()
    formData.append('file', param.file)
    formData.append('topicId', param.topicId.toString())
    formData.append('fileType', param.fileType.toString())
    if (param.description) {
      formData.append('description', param.description)
    }
    
    return post<ApiResponse<DocumentResponse>>(`/api/documents/${originalDocumentId}/reupload`, formData)
  },
  
  /**
   * 学生撤销文档申请（待审核状态）
   * @param id 文档 ID
   * @returns 撤销结果
   */
  cancelDocument: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/documents/${id}/cancel`)
  },

  /**
   * 更新文档信息
   * @param id 文档 ID
   * @param param 更新参数
   * @returns 请求结果
   */
  updateDocument: (id: number | string, param: DocumentUpdateRequest) => {
    return put<ApiResponse<void>>(`/api/documents/${id}`, param)
  },

  /**
   * 审核文档
   * @param param 审核参数
   * @returns 请求结果
   */
  reviewDocument: (param: DocumentReviewRequest) => {
    return post<ApiResponse<void>>('/api/documents/review', param)
  },

  /**
   * 获取用户文档列表
   * @param userId 用户 ID
   * @param params 查询参数
   * @returns 文档列表
   */
  getDocumentsByUser: (userId: number | string, params: DocumentQueryParams) => {
    return get<ApiResponse<DocumentPageResponse>>(`/api/documents/user/${userId}`, params)
  },
  
  /**
   * 获取选题文档列表
   * @param topicId 选题 ID
   * @param params 查询参数
   * @returns 文档列表
   */
  getDocumentsByTopic: (topicId: number | string, params: DocumentQueryParams) => {
    return get<ApiResponse<DocumentPageResponse>>(`/api/documents/topic/${topicId}`, params)
  },
  
  /**
   * 获取指定类型文档列表
   * @param fileType 文件类型
   * @param params 查询参数
   * @returns 文档列表
   */
  getDocumentsByType: (fileType: number | string, params: DocumentQueryParams) => {
    return get<ApiResponse<DocumentPageResponse>>(`/api/documents/type/${fileType}`, params)
  },
  
  /**
   * 获取指定状态文档列表
   * @param reviewStatus 审核状态
   * @param params 查询参数
   * @returns 文档列表
   */
  getDocumentsByStatus: (reviewStatus: number | string, params: DocumentQueryParams) => {
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
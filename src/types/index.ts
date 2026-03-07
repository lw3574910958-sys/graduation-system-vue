/**
 * 统一类型导入出口文件
 * 集中管理所有API类型定义的导入
 */

// 全局类型
export type { ApiResponse, PageQuery, PageResponse } from './global'

// 用户相关类型
export type {
  UserResponse,
  UserCreateRequest,
  UserUpdateRequest,
  UserPageResponse,
  LoginUserInfoResponse,
  UserQueryParams
} from './api/user'

// 课题相关类型
export type {
  TopicResponse,
  TopicCreateRequest,
  TopicUpdateRequest,
  TopicPageResponse,
  TopicQueryParams
} from './api/topic'

// 文档相关类型
export type {
  DocumentResponse,
  DocumentUploadRequest,
  DocumentUpdateRequest,
  DocumentPageResponse,
  DocumentQueryParams
} from './api/document'

// 选题相关类型
export type {
  SelectionResponse,
  SelectionCreateRequest,
  SelectionUpdateRequest,
  SelectionPageResponse,
  SelectionQueryParams
} from './api/selection'

// 成绩相关类型
export type {
  GradeResponse,
  GradeRequest,
  GradePageResponse,
  GradeQueryParams
} from './api/grade'

// 院系相关类型
export type {
  DepartmentResponse,
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
  DepartmentPageResponse,
  DepartmentQueryParams,
  DepartmentTreeResponse
} from './api/department'

// 通知相关类型
export type {
  NoticeResponse,
  NoticeCreateRequest,
  NoticeUpdateRequest,
  NoticePageResponse,
  NoticeQueryParams,
  NoticeTypeEnum,
  NoticePriorityEnum,
  NoticeStatusEnum,
  TargetScopeEnum
} from './api/notice'

// 认证相关类型
export type {
  LoginRequest,
  LoginResponse,
  CaptchaResponse
} from './api/auth'

// 公共类型
export type {
  UploadFileResponse,
  UploadResponse
} from './api/common'
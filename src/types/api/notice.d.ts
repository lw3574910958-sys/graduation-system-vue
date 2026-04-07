// 通知相关类型定义

// 通知响应类型 (对应后端 NoticeVO)
export interface NoticeResponse {
  id: string
  title: string
  content: string
  type: number
  typeDesc: string
  priority: number
  priorityDesc: string
  publisherId: string
  publisherName: string
  publisherAdminId?: string
  publishedAt: string
  startTime?: string // 可能为 null/undefined
  endTime?: string   // 可能为 null/undefined
  status: number
  statusDesc: string
  isSticky: number
  readCount: number
  targetScope: number
  targetScopeDesc: string
  departmentId?: string
  departmentName?: string
  departmentCode?: string
  attachmentUrl?: string
  createdAt: string
  updatedAt: string
}

// 通知创建请求类型 (对应后端 NoticeCreateDTO)
export interface NoticeCreateRequest {
  title: string
  content: string
  type: number
  priority?: number
  startTime?: string
  endTime?: string
  isSticky?: number
  targetScope?: number
  departmentId?: string
  attachmentUrl?: string
  publishNow?: boolean
}

// 通知更新请求类型 (对应后端 NoticeUpdateDTO)
export interface NoticeUpdateRequest {
  title: string
  content: string
  type: number
  priority?: number
  startTime?: string
  endTime?: string
  isSticky?: number
  targetScope?: number
  departmentId?: string
  attachmentUrl?: string
}

// 通知分页查询参数 (对应后端 NoticePageQueryDTO)
export interface NoticeQueryParams {
  current?: number
  size?: number
  title?: string
  type?: number
  priority?: number
  status?: number
  isSticky?: number
  targetScope?: number
  publisherId?: string
}

// 通知分页响应类型
export interface NoticePageResponse {
  records: NoticeResponse[]
  total: number
  size: number
  current: number
  pages: number
}

// 通知类型枚举
export enum NoticeTypeEnum {
  SYSTEM_NOTICE = 1, // 系统通知
  ANNOUNCEMENT = 2,  // 公告
  REMINDER = 3       // 提醒
}

// 通知优先级枚举
export enum NoticePriorityEnum {
  LOW = 1,    // 低
  MEDIUM = 2, // 中
  HIGH = 3    // 高
}

// 通知状态枚举
export enum NoticeStatusEnum {
  DRAFT = 0,     // 草稿
  PUBLISHED = 1, // 已发布
  WITHDRAWN = 2  // 已撤回
}

// 目标范围枚举
export enum TargetScopeEnum {
  ALL = 0,              // 全体
  STUDENT = 1,          // 学生
  TEACHER = 2,          // 教师
  DEPARTMENT_ADMIN = 3  // 院系管理员
}
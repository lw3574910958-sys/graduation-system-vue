/**
 * 全局类型定义
 */

// 用户类型枚举
export enum UserType {
  Student = 'student',
  Teacher = 'teacher',
  Admin = 'admin',
}

// 分页查询参数
export interface PageQuery {
  current?: number
  size?: number
  [key: string]: any
}

// 响应数据结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

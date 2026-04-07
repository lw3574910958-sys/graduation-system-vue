import { get } from '@/utils/request'

/**
 * 仪表盘统计信息 API
 */
export interface DashboardApi {
  /**
   * 获取学生仪表盘信息
   */
  getStudentDashboard: () => Promise<any>

  /**
   * 获取教师仪表盘信息
   */
  getTeacherDashboard: () => Promise<any>

  /**
   * 获取管理员仪表盘信息
   */
  getAdminDashboard: () => Promise<any>

  /**
   * 获取成绩分布统计
   */
  getGradeDistribution: (year?: number) => Promise<any>

  /**
   * 获取选题进度统计
   */
  getTopicProgress: (departmentId?: number | string | null) => Promise<any>

  /**
   * 获取可用的成绩年份列表
   */
  getAvailableGradeYears: () => Promise<any>
}

/**
 * 学生仪表盘信息
 */
export interface StudentDashboardResponse {
  currentStep: number
  topicTitle?: string
}

/**
 * 教师仪表盘信息
 */
export interface TeacherDashboardResponse {
  pendingTopics: number
  totalTopics: number
  pendingSelections: number
  pendingDocuments: number
  totalStudents: number
  confirmedSelections: number
}

/**
 * 管理员仪表盘信息
 */
export interface AdminDashboardResponse {
  pendingTopics: number
  totalStudents: number
  totalTeachers: number
  selectedStudents: number
  unselectedStudents: number
  totalDepartments: number
  totalTopics: number
}

/**
 * 成绩分布统计
 */
export interface GradeDistributionResponse {
  excellent: number
  good: number
  medium: number
  pass: number
  fail: number
  total: number
}

/**
 * 选题进度统计
 */
export interface TopicProgressResponse {
  open: number
  reviewing: number
  selected: number
  closed: number
  total: number
}

/**
 * 仪表盘 API 实现
 */
export const dashboardApi: DashboardApi = {
  getStudentDashboard: () => {
    return get('/api/dashboard/student')
  },

  getTeacherDashboard: () => {
    return get('/api/dashboard/teacher')
  },

  getAdminDashboard: () => {
    return get('/api/dashboard/admin')
  },

  getGradeDistribution: (year?: number) => {
    return get(`/api/dashboard/statistics/grade/distribution${year ? `?year=${year}` : ''}`)
  },

  getTopicProgress: (departmentId?: number | string | null) => {
    // 空字符串、null 或 undefined 都不传参数
    // 注意：雪花算法生成的 ID 是 18-19 位，超出 JavaScript Number 安全范围 (2^53-1)
    // 必须使用字符串传递，避免精度丢失
    let deptId: string | undefined
    if (departmentId === '' || departmentId === null || departmentId === undefined) {
      deptId = undefined
    } else {
      // 直接转为字符串，确保不会丢失精度
      deptId = String(departmentId)
    }
    return get(`/api/dashboard/statistics/topic/progress${deptId !== undefined ? `?departmentId=${deptId}` : ''}`)
  },

  getAvailableGradeYears: () => {
    return get('/api/dashboard/statistics/grade/years')
  }
}

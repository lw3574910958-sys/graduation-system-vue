import { get, post, put, del } from '@/utils/request'
import type {
  GradeResponse,
  GradePageResponse,
  GradeInputRequest,
  GradeQueryParams,
} from '@/types/api/grade'
import type { ApiResponse } from '@/types/global'

export const gradeApi = {
  // 为兼容视图组件而添加的别名方法
  getList: (params: GradeQueryParams) => {
    return gradeApi.getGradePage(params)
  },
  
  /**
   * 录入成绩
   * @param param 成绩录入参数
   * @returns 录入结果
   */
  inputGrade: (param: GradeInputRequest) => {
    return post<ApiResponse<void>>('/api/grades/input', param)
  },
  
  /**
   * 分页查询成绩列表
   * @param params 查询参数
   * @returns 分页结果
   */
  getGradePage: (params: GradeQueryParams) => {
    return get<ApiResponse<GradePageResponse>>('/api/grades/page', params)
  },

  /**
   * 根据 ID 获取成绩详情
   * @param id 成绩 ID
   * @returns 成绩详情
   */
  getGradeById: (id: number | string) => {
    return get<ApiResponse<GradeResponse>>(`/api/grades/${id}`, {})
  },
  
  /**
   * 获取学生成绩列表
   * @param studentId 学生 ID
   * @param params 查询参数
   * @returns 成绩列表
   */
  getGradesByStudent: (studentId: number | string, params: GradeQueryParams) => {
    return get<ApiResponse<GradePageResponse>>(`/api/grades/student/${studentId}`, params)
  },
  
  /**
   * 获取课题成绩列表
   * @param topicId 课题 ID
   * @param params 查询参数
   * @returns 成绩列表
   */
  getGradesByTopic: (topicId: number | string, params: GradeQueryParams) => {
    return get<ApiResponse<GradePageResponse>>(`/api/grades/topic/${topicId}`, params)
  },
  
  /**
   * 获取教师评分成绩列表
   * @param graderId 教师 ID
   * @param params 查询参数
   * @returns 成绩列表
   */
  getGradesByGrader: (graderId: number | string, params: GradeQueryParams) => {
    return get<ApiResponse<GradePageResponse>>(`/api/grades/grader/${graderId}`, params)
  },

  /**
   * 获取成绩统计信息
   * @param params 查询参数
   * @returns 统计结果
   */
  getGradeStatistics: (params: GradeQueryParams) => {
    return get<ApiResponse<any>>('/api/grades/statistics', params)
  },

  /**
   * 导出成绩报表
   * @param params 查询参数
   * @returns 导出结果 (Blob)
   */
  exportGradeReport: (params: GradeQueryParams) => {
    return get<Blob>('/api/grades/export', params, { responseType: 'blob' })
  },
}
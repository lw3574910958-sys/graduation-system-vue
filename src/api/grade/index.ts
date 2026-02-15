import { get, post, put, del } from '@/utils/request'
import type {
  GradeResponse,
  GradePageResponse,
  GradeRequest,
  GradeQueryParams,
} from '@/types/api/grade'
import type { ApiResponse } from '@/types/global'

export const gradeApi = {
  // 为兼容视图组件而添加的别名方法
  create: (param: GradeRequest) => {
    return gradeApi.saveGrade(param)
  },
  update: (id: number | string, param: Partial<GradeRequest>) => {
    return gradeApi.updateGrade(Number(id), param)
  },
  delete: (id: number | string) => {
    return gradeApi.deleteGrade(id)
  },
  getList: (params: GradeQueryParams) => {
    return gradeApi.getGradePage(params)
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
   * 根据ID获取成绩详情
   * @param id 成绩ID
   * @returns 成绩详情
   */
  getGradeById: (id: number | string) => {
    return get<ApiResponse<GradeResponse>>(`/api/grades/${id}`, {})
  },

  /**
   * 创建/更新成绩
   * @param param 成绩信息
   * @returns 请求结果
   */
  saveGrade: (param: GradeRequest) => {
    return post<ApiResponse<void>>('/api/grades', param)
  },

  /**
   * 更新成绩信息
   * @param id 成绩ID
   * @param param 成绩信息
   * @returns 请求结果
   */
  updateGrade: (id: number, param: Partial<GradeRequest>) => {
    return put<ApiResponse<void>>(`/api/grades/${id}`, param)
  },

  /**
   * 删除成绩
   * @param id 成绩ID
   * @returns 请求结果
   */
  deleteGrade: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/grades/${id}`)
  },

  /**
   * 获取学生成绩列表
   * @param studentId 学生ID
   * @param params 查询参数
   * @returns 成绩列表
   */
  getGradesByStudent: (studentId: number, params: GradeQueryParams) => {
    return get<ApiResponse<GradePageResponse>>(`/api/grades/student/${studentId}`, params)
  },

  /**
   * 获取课题成绩列表
   * @param topicId 课题ID
   * @param params 查询参数
   * @returns 成绩列表
   */
  getGradesByTopic: (topicId: number, params: GradeQueryParams) => {
    return get<ApiResponse<GradePageResponse>>(`/api/grades/topic/${topicId}`, params)
  },

  /**
   * 获取教师评分成绩列表
   * @param graderId 教师ID
   * @param params 查询参数
   * @returns 成绩列表
   */
  getGradesByGrader: (graderId: number, params: GradeQueryParams) => {
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
   * @returns 导出结果
   */
  exportGradeReport: (params: GradeQueryParams) => {
    return get<ApiResponse<string>>('/api/grades/export', params)
  },
}
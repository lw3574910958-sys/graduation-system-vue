import { get, post, put, del } from '@/utils/request'
import type {
  TeacherDetailResponse,
  TeacherPageResponse,
  TeacherCreateRequest,
  TeacherUpdateRequest,
  TeacherQueryParams,
} from '@/types/api/teacher'
import type { ApiResponse, PageQuery } from '@/types/global'

export const teacherApi = {
  /**
   * 分页查询教师列表
   * @param params 查询参数
   * @returns 分页结果
   */
  getTeacherPage: (params: TeacherQueryParams) => {
    return get<ApiResponse<TeacherPageResponse>>('/api/teachers/page', params)
  },

  /**
   * 根据ID获取教师详情
   * @param id 教师ID
   * @returns 教师详情
   */
  getTeacherById: (id: number) => {
    return get<ApiResponse<TeacherDetailResponse>>(`/api/teachers/${id}`, {})
  },

  /**
   * 根据用户ID获取教师详情
   * @param userId 用户ID
   * @returns 教师详情
   */
  getTeacherByUserId: (userId: number) => {
    return get<ApiResponse<TeacherDetailResponse>>(`/api/teachers/user/${userId}`, {})
  },

  /**
   * 创建教师信息
   * @param param 教师信息
   * @returns 请求结果
   */
  createTeacher: (param: TeacherCreateRequest) => {
    return post<ApiResponse<void>>('/api/teachers', param)
  },

  /**
   * 更新教师信息
   * @param id 教师ID
   * @param param 教师信息
   * @returns 请求结果
   */
  updateTeacher: (id: number, param: TeacherUpdateRequest) => {
    return put<ApiResponse<void>>(`/api/teachers/${id}`, param)
  },

  /**
   * 删除教师信息
   * @param id 教师ID
   * @returns 请求结果
   */
  deleteTeacher: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/teachers/${id}`)
  },
}
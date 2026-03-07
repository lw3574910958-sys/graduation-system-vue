import { get, post, put, del } from '@/utils/request'
import type {
  StudentDetailResponse,
  StudentPageResponse,
  StudentCreateRequest,
  StudentUpdateRequest,
  StudentQueryParams,
} from '@/types/api/student'
import type { ApiResponse, PageQuery } from '@/types/global'

export const studentApi = {
  /**
   * 分页查询学生列表
   * @param params 查询参数
   * @returns 分页结果
   */
  getStudentPage: (params: StudentQueryParams) => {
    return get<ApiResponse<StudentPageResponse>>('/api/students/page', params)
  },

  /**
   * 根据ID获取学生详情
   * @param id 学生ID
   * @returns 学生详情
   */
  getStudentById: (id: number) => {
    return get<ApiResponse<StudentDetailResponse>>(`/api/students/${id}`, {})
  },

  /**
   * 根据用户ID获取学生详情
   * @param userId 用户ID
   * @returns 学生详情
   */
  getStudentByUserId: (userId: number) => {
    return get<ApiResponse<StudentDetailResponse>>(`/api/students/user/${userId}`, {})
  },

  /**
   * 创建学生信息
   * @param param 学生信息
   * @returns 请求结果
   */
  createStudent: (param: StudentCreateRequest) => {
    return post<ApiResponse<void>>('/api/students', param)
  },

  /**
   * 更新学生信息
   * @param id 学生ID
   * @param param 学生信息
   * @returns 请求结果
   */
  updateStudent: (id: number, param: StudentUpdateRequest) => {
    return put<ApiResponse<void>>(`/api/students/${id}`, param)
  },

  /**
   * 删除学生信息
   * @param id 学生ID
   * @returns 请求结果
   */
  deleteStudent: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/students/${id}`)
  },
}
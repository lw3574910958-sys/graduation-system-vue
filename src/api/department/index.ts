import { get, post, put, del } from '@/utils/request'
import type {
  DepartmentResponse,
  DepartmentPageResponse,
  DepartmentTreeResponse,
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
  DepartmentQueryParams,
} from '@/types/api/department'
import type { ApiResponse } from '@/types/global'

export const departmentApi = {
  // 为兼容视图组件而添加的别名方法
  create: (param: DepartmentCreateRequest) => {
    return departmentApi.createDepartment(param)
  },
  update: (id: number | string, param: DepartmentUpdateRequest) => {
    return departmentApi.updateDepartment(Number(id), param)
  },
  delete: (id: number | string) => {
    return departmentApi.deleteDepartment(id)
  },
  getList: (params: DepartmentQueryParams) => {
    return departmentApi.getDepartmentPage(params)
  },
  
  /**
   * 分页查询部门列表
   * @param params 查询参数
   * @returns 分页结果
   */
  getDepartmentPage: (params: DepartmentQueryParams) => {
    return get<ApiResponse<DepartmentPageResponse>>('/api/departments/page', params)
  },

  /**
   * 获取部门树形结构
   * @returns 部门树
   */
  getDepartmentTree: () => {
    return get<ApiResponse<DepartmentTreeResponse[]>>('/api/departments/tree', {})
  },

  /**
   * 获取所有部门列表（用于下拉框）
   * @returns 部门列表
   */
  getAllDepartments: () => {
    return get<ApiResponse<DepartmentResponse[]>>('/api/departments', {})
  },

  /**
   * 根据ID获取部门详情
   * @param id 部门ID
   * @returns 部门详情
   */
  getDepartmentById: (id: number | string) => {
    return get<ApiResponse<DepartmentResponse>>(`/api/departments/${id}`, {})
  },

  /**
   * 创建新部门
   * @param param 部门信息
   * @returns 请求结果
   */
  createDepartment: (param: DepartmentCreateRequest) => {
    return post<ApiResponse<void>>('/api/departments', param)
  },

  /**
   * 更新部门信息
   * @param id 部门ID
   * @param param 部门信息
   * @returns 请求结果
   */
  updateDepartment: (id: number, param: DepartmentUpdateRequest) => {
    return put<ApiResponse<void>>(`/api/departments/${id}`, param)
  },

  /**
   * 删除部门
   * @param id 部门ID
   * @returns 请求结果
   */
  deleteDepartment: (id: number | string) => {
    return del<ApiResponse<void>>(`/api/departments/${id}`)
  },
}
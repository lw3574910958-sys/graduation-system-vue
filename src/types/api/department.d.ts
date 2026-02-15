// 部门信息响应类型
export interface DepartmentResponse {
  id: number
  name: string
  code: string
  parentId?: number
  level: number
  sort: number
  status: number
  createdAt?: string
  updatedAt?: string
}

// 部门树形结构响应类型
export interface DepartmentTreeResponse {
  id: number
  name: string
  code: string
  children?: DepartmentTreeResponse[]
}

// 部门创建请求类型
export interface DepartmentCreateRequest {
  name: string
  code: string
  parentId?: number
  level?: number
  sort?: number
  status: number
}

// 部门更新请求类型
export interface DepartmentUpdateRequest {
  name?: string
  code?: string
  parentId?: number
  level?: number
  sort?: number
  status?: number
}

// 部门查询参数类型
export interface DepartmentQueryParams {
  name?: string
  code?: string
  status?: number
  current?: number
  size?: number
}

// 部门分页响应类型
export interface DepartmentPageResponse {
  records: DepartmentResponse[]
  total: number
  current: number
  size: number
  pages: number
}
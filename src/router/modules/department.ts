/**
 * @description: 院系管理路由
 */

import type { RouteRecordRaw } from 'vue-router'

const departmentRoutes: Array<RouteRecordRaw> = [
  {
    path: '/department/list',
    name: 'DepartmentList',
    component: () => import('@/views/department/DepartmentList.vue'),
    meta: { title: '院系管理', requiresAuth: true },
  },
  {
    path: '/department/add-or-update',
    name: 'DepartmentAddOrUpdate',
    component: () => import('@/views/department/DepartmentForm.vue'),
    meta: { title: '院系添加/编辑', requiresAuth: true },
  },
]

export default departmentRoutes

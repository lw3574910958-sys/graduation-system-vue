/**
 * @description: 评分管理路由
 */

import type { RouteRecordRaw } from 'vue-router'

const gradeRoutes: Array<RouteRecordRaw> = [
  {
    path: '/grade/list',
    name: 'GradeList',
    component: () => import('@/views/grade/List.vue'),
    meta: { title: '成绩管理', requiresAuth: true },
  },
  {
    path: '/grade/add-or-update',
    name: 'GradeAddOrUpdate',
    component: () => import('@/views/grade/AddOrUpdate.vue'),
    meta: { title: '成绩添加/编辑', requiresAuth: true },
  },
]

export default gradeRoutes

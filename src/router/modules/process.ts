import type { RouteRecordRaw } from 'vue-router'

const processRoutes: Array<RouteRecordRaw> = [
  {
    path: '/process/list',
    name: 'ProcessList',
    component: () => import('@/views/process/List.vue'),
    meta: { title: '过程管理', requiresAuth: true }
  },
  {
    path: '/process/add-or-update',
    name: 'ProcessAddOrUpdate',
    component: () => import('@/views/process/AddOrUpdate.vue'),
    meta: { title: '过程添加/编辑', requiresAuth: true }
  }
]

export default processRoutes
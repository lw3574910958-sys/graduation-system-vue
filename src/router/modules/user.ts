/**
 * @description: 用户管理路由
 */

import type { RouteRecordRaw } from 'vue-router'

const userRoutes: Array<RouteRecordRaw> = [
  {
    path: '/user/list',
    name: 'UserList',
    component: () => import('@/views/user/List.vue'),
    meta: { title: '用户管理', requiresAuth: true },
  },
  {
    path: '/user/add-or-update',
    name: 'UserAddOrUpdate',
    component: () => import('@/views/user/AddOrUpdate.vue'),
    meta: { title: '用户添加/编辑', requiresAuth: true },
  },
]

export default userRoutes

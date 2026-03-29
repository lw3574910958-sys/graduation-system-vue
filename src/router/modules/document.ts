/**
 * @description: 文档管理路由
 */

import type { RouteRecordRaw } from 'vue-router'

const documentRoutes: Array<RouteRecordRaw> = [
  {
    path: '/document/list',
    name: 'DocumentList',
    component: () => import('@/views/document/List.vue'),
    meta: { title: '文档管理', requiresAuth: true },
  },
]

export default documentRoutes

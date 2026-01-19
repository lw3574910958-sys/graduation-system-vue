import type { RouteRecordRaw } from 'vue-router'

const documentRoutes: Array<RouteRecordRaw> = [
  {
    path: '/document/list',
    name: 'DocumentList',
    component: () => import('@/views/document/List.vue'),
    meta: { title: '文档管理', requiresAuth: true }
  },
  {
    path: '/document/add-or-update',
    name: 'DocumentAddOrUpdate',
    component: () => import('@/views/document/AddOrUpdate.vue'),
    meta: { title: '文档添加/编辑', requiresAuth: true }
  }
]

export default documentRoutes
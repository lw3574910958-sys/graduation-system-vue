import type { RouteRecordRaw } from 'vue-router'

const selectionRoutes: Array<RouteRecordRaw> = [
  {
    path: '/selection/list',
    name: 'SelectionList',
    component: () => import('@/views/selection/List.vue'),
    meta: { title: '选题管理', requiresAuth: true }
  },
  {
    path: '/selection/add-or-update',
    name: 'SelectionAddOrUpdate',
    component: () => import('@/views/selection/AddOrUpdate.vue'),
    meta: { title: '选题添加/编辑', requiresAuth: true }
  }
]

export default selectionRoutes
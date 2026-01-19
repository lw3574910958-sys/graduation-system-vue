import type { RouteRecordRaw } from 'vue-router'

const topicRoutes: Array<RouteRecordRaw> = [
  {
    path: '/topic/list',
    name: 'TopicList',
    component: () => import('@/views/topic/List.vue'),
    meta: { title: '题目管理', requiresAuth: true }
  },
  {
    path: '/topic/add-or-update',
    name: 'TopicAddOrUpdate',
    component: () => import('@/views/topic/AddOrUpdate.vue'),
    meta: { title: '题目添加/编辑', requiresAuth: true }
  }
]

export default topicRoutes
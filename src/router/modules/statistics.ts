import type { RouteRecordRaw } from 'vue-router'

const statisticsRoutes: Array<RouteRecordRaw> = [
  {
    path: '/statistics/list',
    name: 'StatisticsList',
    component: () => import('@/views/statistics/List.vue'),
    meta: { title: '统计管理', requiresAuth: true }
  },
  {
    path: '/statistics/add-or-update',
    name: 'StatisticsAddOrUpdate',
    component: () => import('@/views/statistics/AddOrUpdate.vue'),
    meta: { title: '统计添加/编辑', requiresAuth: true }
  }
]

export default statisticsRoutes
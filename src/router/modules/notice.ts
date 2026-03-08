/**
 * @description: 通知公告管理路由
 */

import type { RouteRecordRaw } from 'vue-router'

const noticeRoutes: Array<RouteRecordRaw> = [
  {
    path: '/notice/list',
    name: 'NoticeList',
    component: () => import('@/views/notice/List.vue'),
    meta: { title: '公告管理', requiresAuth: true },
  },
]

export default noticeRoutes

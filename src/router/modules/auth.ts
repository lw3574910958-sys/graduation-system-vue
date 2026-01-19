import type { RouteRecordRaw } from 'vue-router'

const authRoutes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录' }
  }
]

export default authRoutes
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'
import { USER_TYPE } from '@/constants'
import { webSocketService } from '@/utils/webSocketService'
import authRoutes from './modules/auth'
import userRoutes from './modules/user'
import departmentRoutes from './modules/department'
import topicRoutes from './modules/topic'
import selectionRoutes from './modules/selection'
import documentRoutes from './modules/document'
import gradeRoutes from './modules/grade'
import noticeRoutes from './modules/notice'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },

    ...authRoutes,

    // 主应用布局（所有业务页面都在这里）
    {
      path: '/index',
      component: () => import('@/components/layout/BasicLayout.vue'),
      meta: { requiresAuth: true },

      children: [
        // 默认重定向到欢迎页
        { path: '', redirect: '/welcome' },

        // 欢迎页
        {
          path: '/welcome',
          name: 'Welcome',
          component: () => import('@/views/WelcomeVue.vue'),
          meta: { requiresAuth: true },
        },

        // Dashboard 页面
        {
          path: '/student-dashboard',
          name: 'StudentDashboard',
          component: () => import('@/views/dashboard/StudentDashboard.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/teacher-dashboard',
          name: 'TeacherDashboard',
          component: () => import('@/views/dashboard/TeacherDashboard.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/admin-dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/dashboard/AdminDashboard.vue'),
          meta: { requiresAuth: true },
        },

        // 用户管理模块
        ...userRoutes,
        // 院系管理模块
        ...departmentRoutes,
        // 题目管理模块
        ...topicRoutes,
        // 选题管理模块
        ...selectionRoutes,
        // 文档管理模块
        ...documentRoutes,
        // 成绩管理模块
        ...gradeRoutes,
        // 通知公告模块
        ...noticeRoutes,
      ],
    },

    // 404 页面
    { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFound.vue') },
  ],
})

/**
 * 路由守卫
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 管理 WebSocket连接
  if (authStore.checkAuth()) {
    // 已登录且 WebSocket 未连接时，尝试连接
    if (!webSocketService.isConnectedStatus()) {
      console.log('路由守卫：用户已登录，WebSocket 未连接，开始连接...')
      webSocketService.connect()
    }
  } else {
    // 未登录时断开 WebSocket连接，并禁止重连（永久断开）
    console.log('路由守卫：用户未登录，断开 WebSocket连接')
    webSocketService.disconnect(true)
  }

  if (to.meta.requiresAuth) {
    if (authStore.checkAuth()) {
      // 只有在用户信息不存在且没有在获取中时才调用接口
      if (!authStore.userInfo && !authStore.isFetchingUserInfo) {
        try {
          await authStore.fetchUserInfo()
          next()
        } catch (error: any) {
          if (error.message === 'UNAUTHORIZED') {
            next('/login')
          } else {
            ElMessage.error('获取用户信息失败')
            next('/login')
          }
        }
      } else {
        // 用户信息已存在或正在获取，直接放行
        next()
      }
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router

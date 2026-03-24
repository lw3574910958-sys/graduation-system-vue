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
      redirect: '/dashboard', // 默认跳转到 Dashboard 父路由，由子路由决定显示哪个
      children: [
        // 默认重定向到欢迎页
        { path: '', redirect: '/dashboard' },

        // Dashboard 页面
        {
          path: '/dashboard',
          name: 'Dashboard',
          // 根据用户类型动态显示不同仪表盘
          component: () => import('@/views/dashboard/Index.vue'),
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

    // 404 页面（必须放在最后）
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
      meta: { 
        title: '页面未找到',
        requiresAuth: true // 需要登录才能访问 404 页面
      },
    },
    // 通配符路由，捕获所有未匹配的路径
    {
      path: '/:pathMatch(.*)*',
      redirect: (to) => {
        // 未登录时重定向到登录页
        const authStore = useAuthStore()
        if (!authStore.checkAuth()) {
          return '/login'
        }
        // 已登录时重定向到 404 页面
        return '/404'
      },
    },
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

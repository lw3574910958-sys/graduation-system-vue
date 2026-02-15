import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'
import { USER_TYPE } from '@/constants'
import authRoutes from './modules/auth'
import userRoutes from './modules/user'
import departmentRoutes from './modules/department'
import topicRoutes from './modules/topic'
import selectionRoutes from './modules/selection'
import documentRoutes from './modules/document'
import gradeRoutes from './modules/grade'
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

  if (to.meta.requiresAuth) {
    if (authStore.checkAuth()) {
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
      next('/login')
    }
  } else {
    next()
  }
})

export default router

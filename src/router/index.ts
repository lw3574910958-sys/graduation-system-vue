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
        { path: '', redirect: '/dashboard' },

        // Dashboard 页面
        {
          path: '/dashboard',
          name: 'Dashboard',
          redirect: (to) => {
            // 根据用户类型重定向到对应的仪表盘
            const authStore = useAuthStore()
            const userType = authStore.userInfo?.userType
            
            if (userType === USER_TYPE.STUDENT) {
              return '/dashboard/student'
            } else if (userType === USER_TYPE.TEACHER) {
              return '/dashboard/teacher'
            } else if (userType === USER_TYPE.SYSTEM_ADMIN || userType === USER_TYPE.DEPARTMENT_ADMIN) {
              return '/dashboard/admin'
            }
            
            // 默认重定向到学生仪表盘（兜底方案）
            return '/dashboard/student'
          },
          meta: { requiresAuth: true },
          children: [
            {
              path: 'student',
              name: 'StudentDashboard',
              component: () => import('@/views/dashboard/StudentDashboard.vue'),
              meta: { requiresAuth: true, title: '学生仪表盘', userType: [USER_TYPE.STUDENT] },
            },
            {
              path: 'teacher',
              name: 'TeacherDashboard',
              component: () => import('@/views/dashboard/TeacherDashboard.vue'),
              meta: { requiresAuth: true, title: '教师仪表盘', userType: [USER_TYPE.TEACHER] },
            },
            {
              path: 'admin',
              name: 'AdminDashboard',
              component: () => import('@/views/dashboard/AdminDashboard.vue'),
              meta: { requiresAuth: true, title: '管理员仪表盘', userType: [USER_TYPE.SYSTEM_ADMIN, USER_TYPE.DEPARTMENT_ADMIN] },
            }
          ]
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
          // 获取用户信息后检查路由权限
          const redirectPath = checkRoutePermission(to, authStore)
          if (redirectPath && redirectPath !== to.path) {
            ElMessage.warning('您无权访问该页面，已为您跳转到对应仪表盘')
            next(redirectPath)
          } else {
            next()
          }
        } catch (error: any) {
          if (error.message === 'UNAUTHORIZED') {
            next('/login')
          } else {
            ElMessage.error('获取用户信息失败')
            next('/login')
          }
        }
      } else {
        // 用户信息已存在或正在获取，检查权限
        const redirectPath = checkRoutePermission(to, authStore)
        if (redirectPath && redirectPath !== to.path) {
          ElMessage.warning('您无权访问该页面，已为您跳转到对应仪表盘')
          next(redirectPath)
        } else {
          next()
        }
      }
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

/**
 * 检查路由权限（复用已有的权限验证逻辑）
 */
function checkRoutePermission(to: any, authStore: any): string | null {
  const userType = authStore.userInfo?.userType
  const allowedUserTypes = to.meta.userType
  
  // 如果路由配置了允许的用户类型
  if (allowedUserTypes && Array.isArray(allowedUserTypes)) {
    if (!userType || !allowedUserTypes.includes(userType)) {
      // 无权访问，返回应该跳转的路径
      return getDefaultDashboardPath(userType)
    }
  }
  return null
}

/**
 * 获取默认仪表盘路径
 */
function getDefaultDashboardPath(userType: string): string {
  if (userType === USER_TYPE.STUDENT) {
    return '/dashboard/student'
  } else if (userType === USER_TYPE.TEACHER) {
    return '/dashboard/teacher'
  } else if (userType === USER_TYPE.SYSTEM_ADMIN || userType === USER_TYPE.DEPARTMENT_ADMIN) {
    return '/dashboard/admin'
  }
  // 兜底方案
  return '/dashboard/student'
}

export default router

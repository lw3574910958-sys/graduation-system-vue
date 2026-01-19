import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'
import authRoutes from './modules/auth'
import userRoutes from './modules/user'
import departmentRoutes from './modules/department'
import topicRoutes from './modules/topic'
import selectionRoutes from './modules/selection'
import documentRoutes from './modules/document'
import gradeRoutes from './modules/grade'
import processRoutes from './modules/process'
import statisticsRoutes from './modules/statistics'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    {
      path: '/',
      redirect: '/index',
      meta: { requiresAuth: true }
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
    // 过程记录模块
    ...processRoutes,
    // 数据统计模块
    ...statisticsRoutes,
    {
      path: '/index',
      name: 'Index',
      redirect: { name: 'Welcome' },
      component: () => import('@/layouts/BasicLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '/welcome',
          name: 'Welcome',
          component: () => import('@/views/WelcomeVue.vue'),
          meta: { requiresAuth: true }
        },
        // 用户管理
        {
          path: '/user/list',
          name: 'UserList',
          component: () => import('@/views/user/List.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/user/add-or-update',
          name: 'UserAddOrUpdate',
          component: () => import('@/views/user/AddOrUpdate.vue'),
          meta: { requiresAuth: true }
        },
        // 课题管理
        {
          path: '/topic/list',
          name: 'TopicList',
          component: () => import('@/views/topic/List.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/topic/add-or-update',
          name: 'TopicAddOrUpdate',
          component: () => import('@/views/topic/AddOrUpdate.vue'),
          meta: { requiresAuth: true }
        },
        // 选题管理
        {
          path: '/selection/list',
          name: 'SelectionList',
          component: () => import('@/views/selection/List.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/selection/add-or-update',
          name: 'SelectionAddOrUpdate',
          component: () => import('@/views/selection/AddOrUpdate.vue'),
          meta: { requiresAuth: true }
        },
        // 文档管理
        {
          path: '/document/list',
          name: 'DocumentList',
          component: () => import('@/views/document/List.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/document/add-or-update',
          name: 'DocumentAddOrUpdate',
          component: () => import('@/views/document/AddOrUpdate.vue'),
          meta: { requiresAuth: true }
        },
        // 成绩管理
        {
          path: '/grade/list',
          name: 'GradeList',
          component: () => import('@/views/grade/List.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/grade/add-or-update',
          name: 'GradeAddOrUpdate',
          component: () => import('@/views/grade/AddOrUpdate.vue'),
          meta: { requiresAuth: true }
        },
        // 过程记录管理
        {
          path: '/process/list',
          name: 'ProcessList',
          component: () => import('@/views/process/List.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/process/add-or-update',
          name: 'ProcessAddOrUpdate',
          component: () => import('@/views/process/AddOrUpdate.vue'),
          meta: { requiresAuth: true }
        },
        // 院系管理
        {
          path: '/department/list',
          name: 'DepartmentList',
          component: () => import('@/views/department/DepartmentList.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/department/add-or-update',
          name: 'DepartmentAddOrUpdate',
          component: () => import('@/views/department/DepartmentForm.vue'),
          meta: { requiresAuth: true }
        },
        // 数据统计管理
        {
          path: '/statistics/list',
          name: 'StatisticsList',
          component: () => import('@/views/statistics/List.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/statistics/add-or-update',
          name: 'StatisticsAddOrUpdate',
          component: () => import('@/views/statistics/AddOrUpdate.vue'),
          meta: { requiresAuth: true }
        },

      ],
    },
  ],
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()
  
  // 如果目标页面不需要认证且是登录页，允许访问
  if (to.path === '/login') {
    // 如果已登录，重定向到首页
    if (authStore.checkAuth()) {
      return { path: '/' }
    }
    return true
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.checkAuth()) {
    return { path: '/login' }
  }
  
  return true
})

export default router

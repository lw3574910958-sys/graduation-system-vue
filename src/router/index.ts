import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/index',
      name: 'Index',
      component: () => import('@/views/Index.vue'),

      children: [
        {
          path: '/welcome',
          name: 'Welcome',
          component: () => import('@/views/WelcomeVue.vue'),
        },
        {
          path: '/list',
          name: 'List',
          component: () => import('@/views/admin/List.vue'),
        },
      ],
    },
  ],
})

export default router

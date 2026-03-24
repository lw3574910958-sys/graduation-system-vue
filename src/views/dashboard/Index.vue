<template>
  <div class="dashboard-index">
    <!-- 未登录时不渲染任何仪表盘 -->
    <component :is="CurrentDashboard" v-if="isAuthenticated" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores'
import { USER_TYPE } from '@/constants'
import StudentDashboard from './StudentDashboard.vue'
import TeacherDashboard from './TeacherDashboard.vue'
import AdminDashboard from './AdminDashboard.vue'

const authStore = useAuthStore()

// 检查是否已认证
const isAuthenticated = computed(() => {
  return authStore.checkAuth()
})

// 根据用户类型动态选择仪表盘组件
const CurrentDashboard = computed(() => {
  const userType = authStore.userInfo?.userType
  
  // 未登录时不渲染任何仪表盘
  if (!isAuthenticated.value) {
    return null
  }
  
  if (userType === USER_TYPE.STUDENT) {
    return StudentDashboard
  } else if (userType === USER_TYPE.TEACHER) {
    return TeacherDashboard
  } else if (userType === USER_TYPE.SYSTEM_ADMIN || userType === USER_TYPE.DEPARTMENT_ADMIN) {
    return AdminDashboard
  }
  
  // 默认显示学生仪表盘（兜底方案）
  return StudentDashboard
})
</script>

<style scoped>
.dashboard-index {
  width: 100%;
}
</style>

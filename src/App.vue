<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores'

// 初始化认证状态
const authStore = useAuthStore();

// 如果已登录，尝试获取用户信息
if (authStore.checkAuth()) {
  authStore.fetchUserInfo().catch(error => {
    console.warn('获取用户信息失败:', error);
  });
}
</script>

<template>
  <RouterView />
</template>

<style scoped>
/* App组件根样式 */
</style>

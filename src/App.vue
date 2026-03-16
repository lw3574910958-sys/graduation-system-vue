<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores'
import GlobalLoading from '@/components/common/GlobalLoading.vue'

// 初始化认证状态
const authStore = useAuthStore();

// 如果已登录且用户信息不存在，尝试获取用户信息
if (authStore.checkAuth() && !authStore.userInfo && !authStore.isFetchingUserInfo) {
  authStore.fetchUserInfo().catch(error => {
    console.warn('获取用户信息失败:', error);
  });
}
</script>

<template>
  <RouterView />
  <GlobalLoading ref="globalLoading" />
</template>

<style scoped>
/* App组件根样式 */
</style>

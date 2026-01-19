<template>
  <div class="header">
    <div class="header-menu">
      <div class="header-logo">
        <img src="@/assets/login/logo.png" />
        <div class="header-title">高校毕业设计管理系统</div>
      </div>
      <div class="header-rinfo">
        当前用户:
        <span>{{ userInfo?.realName || userInfo?.username || '未知用户' }}</span>
        <span class="header-exit">
          <a @click="loginOut()">退出登录</a>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)

const router = useRouter()

async function loginOut() {
  try {
    await authApi.logout()
  } catch (error) {
    console.error('退出登录失败:', error)
  } finally {
    authStore.clearAuth()
    router.push('/login')
  }
}
</script>

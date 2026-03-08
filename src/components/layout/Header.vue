<template>
  <div class="header">
    <div class="header-menu">
      <div class="header-logo">
        <img :src="logoImageUrl" />
        <div class="header-title">高校毕业设计管理系统</div>
      </div>
      <div class="header-rinfo">
        当前用户:
        <span>{{ userInfo?.realName || '未知用户' }}</span>
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
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import logoUrl from '@/assets/login/logo.png?url'
import { webSocketService } from '@/utils/webSocketService'

const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)

const router = useRouter()

// Logo URL 作为响应式变量
const logoImageUrl = logoUrl

async function loginOut() {
  try {
    await authApi.logout()
    ElMessage.success('退出登录成功')
  } catch (error) {
    console.error('退出登录失败:', error)
  } finally {
    // 先断开 WebSocket连接（永久断开）
    webSocketService.disconnect(true)
    
    // 清除认证信息
    authStore.clearAuth()
    
    // 跳转到登录页
    router.push('/login')
  }
}
</script>

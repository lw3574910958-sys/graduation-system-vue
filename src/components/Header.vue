<template>
  <div class="header">
    <div class="header-menu">
      <div class="header-logo">
        <div class="header-title">MyApp Admin</div>
      </div>
      <div class="header-rinfo">
        当前用户:
        <span>admin</span>
        <span class="header-exit">
          <a @click="loginOut()">退出登录</a>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { adminApi } from '@/api/admin-api'

async function loginOut() {
  try {
    await adminApi.logout()
    window.location.href = '/login'
  } catch (error) {
    console.error(error)
  }
}
</script>

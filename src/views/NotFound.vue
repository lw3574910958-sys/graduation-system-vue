<!-- @/views/NotFound.vue -->
<template>
  <div class="not-found-container">
    <el-result
      icon="warning"
      title="404 页面未找到"
      sub-title="抱歉，您访问的页面不存在或已被移除。"
    >
      <template #extra>
        <el-button type="primary" @click="goHome"> 返回首页 </el-button>
        <el-button @click="goBack"> 返回上一页 </el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * 跳转到首页
 */
const goHome = () => {
  router.push('/welcome')
}

/**
 * 跳转到上一页
 */
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}
</style>

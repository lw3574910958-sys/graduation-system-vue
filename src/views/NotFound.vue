<!-- @/views/NotFound.vue -->
<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="not-found-image">
        <svg viewBox="0 0 500 400" class="error-svg">
          <!-- 背景装饰 -->
          <circle cx="250" cy="200" r="150" fill="#f0f2f5" />
          <circle cx="250" cy="200" r="100" fill="#e6e8eb" />
          
          <!-- 404 文字 -->
          <text x="250" y="220" font-size="120" font-weight="bold" fill="#909399" text-anchor="middle" font-family="Arial, sans-serif">
            404
          </text>
          
          <!-- 装饰元素 -->
          <circle cx="150" cy="120" r="20" fill="#409EFF" opacity="0.3" />
          <circle cx="350" cy="280" r="30" fill="#67C23A" opacity="0.3" />
          <circle cx="380" cy="150" r="25" fill="#E6A23C" opacity="0.3" />
        </svg>
      </div>
      
      <el-result
        icon="warning"
        title="404 页面未找到"
        sub-title="抱歉，您访问的页面不存在或已被移除"
        class="not-found-result"
      >
        <template #extra>
          <div class="button-group">
            <el-button type="primary" @click="goHome" :icon="House">
              返回首页
            </el-button>
            <el-button @click="goBack" :icon="Back">
              返回上一页
            </el-button>
          </div>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { House, Back, Grid, InfoFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()

/**
 * 跳转到首页
 */
const goHome = () => {
  router.push('/dashboard')
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

/**
 * 跳转到仪表盘
 */
const goToDashboard = () => {
  if (authStore.checkAuth()) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.not-found-content {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 60px 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.not-found-image {
  margin-bottom: 30px;
}

.error-svg {
  width: 100%;
  max-width: 400px;
  height: auto;
}

.not-found-result {
  margin-bottom: 30px;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.button-group .el-button {
  min-width: 120px;
}

.help-tips {
  margin-top: 20px;
}

.help-tips .el-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
}

.help-tips .el-icon {
  font-size: 14px;
}
</style>

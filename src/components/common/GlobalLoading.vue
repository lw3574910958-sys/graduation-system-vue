<!-- 全局Loading状态显示组件 -->
<template>
  <div v-if="showGlobalLoading" class="global-loading-overlay">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <div class="loading-text">{{ loadingMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAppStateStore } from '@/stores'

const appStateStore = useAppStateStore()

// Loading状态
const showGlobalLoading = computed(() => appStateStore.isLoading)
const loadingMessage = ref('加载中...')

// 监听loading状态变化
watch(showGlobalLoading, (newVal) => {
  if (newVal) {
    loadingMessage.value = '加载中...'
  }
})

// 提供外部控制方法
defineExpose({
  show(message?: string) {
    if (message) {
      loadingMessage.value = message
    }
    appStateStore.showLoading()
  },
  hide() {
    appStateStore.hideLoading()
  },
  updateMessage(message: string) {
    loadingMessage.value = message
  }
})
</script>

<style scoped>
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-content {
  background: white;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-content {
    padding: 24px;
    min-width: 160px;
  }
  
  .loading-spinner {
    width: 32px;
    height: 32px;
  }
  
  .loading-text {
    font-size: 14px;
  }
}
</style>
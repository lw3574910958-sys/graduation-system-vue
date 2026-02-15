<template>
  <el-avatar
    :shape="shape"
    :size="size"
    :src="avatarUrl"
    :icon="icon"
    :fit="fit"
    @error="handleError"
    v-bind="attrs"
    :loading="isLoading"
  >
    <template #loading>
      <el-icon><Loading /></el-icon>
    </template>
  </el-avatar>
</template>

<script setup lang="ts">
import { computed, useAttrs, ref } from 'vue'
import { Loading } from '@element-plus/icons-vue'

const props = defineProps({
  // 头像URL
  avatar: {
    type: String,
    default: ''
  },
  // 形状: circle 或 square
  shape: {
    type: String,
    default: 'circle'
  },
  // 尺寸
  size: {
    type: [Number, String],
    default: 40
  },
  // 图片填充方式
  fit: {
    type: String,
    default: 'cover'
  },
  // 默认图标
  icon: {
    type: String,
    default: 'UserFilled'
  }
})

const attrs = useAttrs()
const isLoading = ref(false)

// 计算头像URL，处理空值和相对路径
const avatarUrl = computed(() => {
  if (!props.avatar) return ''
  
  // 如果是相对路径，添加基础URL前缀
  if (props.avatar.startsWith('/')) {
    return `${import.meta.env.VITE_API_BASE_URL}${props.avatar}`
  }
  
  // 如果是完整URL，直接返回
  if (props.avatar.startsWith('http')) {
    return props.avatar
  }
  
  // 其他情况，假设为相对路径
  return `${import.meta.env.VITE_API_BASE_URL}/${props.avatar}`
})

// 错误处理：当图片加载失败时，使用默认图标
const handleError = () => {
  isLoading.value = false
  // 可以在这里添加错误日志或其他处理
}

// 加载开始事件
const handleLoadStart = () => {
  isLoading.value = true
}

// 加载完成事件
const handleLoadEnd = () => {
  isLoading.value = false
}
</script>
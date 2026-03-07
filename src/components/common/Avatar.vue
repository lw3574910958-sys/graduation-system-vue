<template>
  <el-avatar
    :shape="shape"
    :size="size"
    :src="showDefault ? '' : avatarUrl"
    :icon="icon"
    :fit="fit"
    @error="handleError"
    v-bind="attrs"
    :loading="isLoading"
    :style="avatarStyle"
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
const hasAvatar = ref(true) // 标记是否有头像

// 计算头像 URL，处理空值和相对路径
const avatarUrl = computed(() => {
  if (!props.avatar) {
    hasAvatar.value = false
    return ''
  }
  
  // 如果是相对路径，添加基础 URL 前缀
  if (props.avatar.startsWith('/')) {
    return `${import.meta.env.VITE_API_BASE_URL}${props.avatar}`
  }
  
  // 如果是完整 URL，直接返回
  if (props.avatar.startsWith('http')) {
    return props.avatar
  }
  
  // 其他情况，假设为相对路径
  hasAvatar.value = true
  return `${import.meta.env.VITE_API_BASE_URL}/${props.avatar}`
})

// 计算是否显示默认头像
const showDefault = computed(() => {
  return !hasAvatar.value
})

// 计算头像样式
const avatarStyle = computed(() => {
  if (!hasAvatar.value) {
    return {
      backgroundColor: '#d9d9d9', // 灰色背景
      color: '#8c8c8c' // 图标颜色
    }
  }
  return {}
})

// 错误处理：当图片加载失败时，使用默认头像
const handleError = () => {
  isLoading.value = false
  hasAvatar.value = false
  // 图片加载失败，切换为默认灰色头像显示
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
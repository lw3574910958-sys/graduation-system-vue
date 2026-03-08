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
import { computed, useAttrs, ref, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'

const props = defineProps({
  // 头像 URL
  avatar: {
    type: String,
    default: ''
  },
  // 形状：circle 或 square
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

// ✅ 监听 avatar 变化，确保组件复用时状态正确重置
watch(() => props.avatar, (newVal: string) => {
  if (!newVal) {
    hasAvatar.value = false
  } else {
    hasAvatar.value = true
  }
}, { immediate: true })

// 计算头像 URL，处理空值和相对路径
const avatarUrl = computed(() => {
  if (!props.avatar) {
    hasAvatar.value = false
    return ''
  }
  
  // 如果已经是完整 URL，直接返回
  if (props.avatar.startsWith('http')) {
    return props.avatar
  }
  
  // 如果是相对路径，需要添加 /files 前缀和基础 URL
  const pathWithPrefix = props.avatar.startsWith('/files')
    ? props.avatar  // 已经有 /files 前缀
    : props.avatar.startsWith('/')
      ? '/files' + props.avatar  // 有 / 但没有 /files
      : '/files/' + props.avatar  // 没有 /，添加 /files/
  
  hasAvatar.value = true
  return `${import.meta.env.VITE_API_BASE_URL}${pathWithPrefix}`
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
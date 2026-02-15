<template>
  <el-tag :type="statusType" size="small">
    {{ statusText }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: number | string
}

const props = defineProps<Props>()

// 计算状态类型
const statusType = computed(() => {
  if (typeof props.status === 'number') {
    return props.status === 1 ? 'success' : 'danger'
  }
  // 如果是字符串，转换为数字
  const numStatus = Number(props.status)
  return numStatus === 1 ? 'success' : 'danger'
})

// 计算状态文本
const statusText = computed(() => {
  if (typeof props.status === 'number') {
    return props.status === 1 ? '启用' : '禁用'
  }
  // 如果是字符串
  const numStatus = Number(props.status)
  return numStatus === 1 ? '启用' : '禁用'
})
</script>